import { DataSource } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { DataSet } from './data-set';
import { DataSetPoint } from './data-set-point';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
  ApexYAxis
} from "ng-apexcharts";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SensorComponent } from '../filter/sensor-filter/sensor.component';
import { FilterModel } from 'src/app/model/filter-model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
};
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  drillStart = 'Hrvatska';
  drillPath: string[] = []; 
  isLoadingData = true;
  public chartConfig: Partial<ChartOptions>[] = [];
  @ViewChild('graphComponent') graphComponent: any;
  fullHeight = document.body.offsetHeight - 25;
  chartWidthReduction = 30;
  @BlockUI() blockUI: NgBlockUI;
  originalChartData: DataSet[] = [];
  seriesLabels: string[]; //using first row to extract sensor names (used to name data series)
  sensorSelectionChangedTimeout;
  activeSensors = [];
  chartData: DataSet[] = [];
  
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { 
  }
  
  renderChart(chartName: string) {
    return this.activeSensors.indexOf(chartName) !== -1;
  }

  afterChartRendered = (chartContext: any, config?: any) => {
    if(this.chartConfig[config.config.chart.id]) {
      this.chartConfig[config.config.chart.id].series = [this.chartData[config.config.chart.id]];
    }
  }
  getChartConfigTemplate(): ChartOptions {
    let configTemplate: ChartOptions  = {
      series: [],
      chart: {
        height : 0,
        width : '100%',
        type: "line",
        group: 'aqi',
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true
        },
        events: {
          mounted: null
        },
        toolbar: {
          show: true
        },
        animations : {enabled: false},
        redrawOnWindowResize: true,
        redrawOnParentResize: true
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      yaxis: {
        labels: {
          minWidth: 40
        }
      },
      xaxis: {
        labels: {show : true},
        type : 'datetime'
      },
      tooltip: {
        enabled: true,
        x : {
          show: false,
          format: 'dd.MM.yyyy HH:mm:ss'
        }
      }

    };
    return configTemplate;
  }
  getChartConfig(chartId: string): ChartOptions {
    let result: ChartOptions;
    if(!this.chartConfig[chartId]) {
        result = JSON.parse(JSON.stringify(this.getChartConfigTemplate()));
        result.chart.height = 200;
        result.title.text = chartId;
        this.chartConfig[chartId] = result;
    } else {
      result = this.chartConfig[chartId];  
    }
    return result;
  }
  initCharts(data: DataSet[]) {
    if(!data || data.length == 0) {
      this.chartConfig.forEach(ch => {
        ch.series = [];
      })
      this.blockUI.stop();
      return;
    }
    this.chartConfig = [];
    data.forEach((element: any, i:number) => {
      this.chartConfig[element.name] = JSON.parse(JSON.stringify(this.getChartConfigTemplate()));
      this.chartConfig[element.name].chart.id = element.name;
      this.chartConfig[element.name].chart.height = 300 //Math.trunc((this.fullHeight - 110)/(data.length <= 4 ? data.length : 4))
      this.chartConfig[element.name].title.text = element.name;
      this.chartConfig[element.name].chart.events.mounted = this.afterChartRendered;

      this.chartData[element.name] = element;
    });
  }

  ngAfterViewInit(): void {

  }
  getColor(sensorName: string): string { 
    let result = '';
    let colors = ['rgb(0, 0, 102)', //used every trid color from color palete. started at top right corner (https://www.w3schools.com/colors/colors_picker.asp)
                'rgb(0, 0, 153)',
                'rgb(51, 102, 255)',
                'rgb(102, 102, 153)',
                'rgb(153, 102, 255)',
                'rgb(153, 204, 255)',
                'rgb(0, 153, 255)',
                'rgb(51, 102, 204)',
                'rgb(51, 204, 204)',
                'rgb(102, 255, 255)',
                'rgb(0, 255, 153)',
                '#43BCCD',
                '#4CAF50']
    if(sensorName === 'aqi') {
      result = colors[colors.length-1];
    } else {
      result = colors[colors.length-2];
    }
    return result;
  }

  ngOnInit(): void {
    let colorIndex = 0;
    this.dataStorageService.loadingStatusBus.subscribe((isLoadingData : boolean) => { //this subscription ensures only all data is sent to graph
      this.isLoadingData = isLoadingData;
      if(!isLoadingData) {
        this.dataStorageService.availableDataBus.subscribe((d :RawData[]) => {
          if(this.isLoadingData) {
            return;
          }
          if(!d) d = [];
          console.log(d);
          this.originalChartData = [];
          this.seriesLabels = d && d.length > 0 ? Object.keys(d[0]) : []; //using first row to extract sensor names (used to name data series and set chart id's )
          this.seriesLabels = this.seriesLabels.filter(v => {return v != 'measured' && v != 'gps'})
          
          let getDataSetForSensor = (sensorName: string): DataSet  => { //returns new/existing data set for sensor name
            let result;
            let existingDs = this.originalChartData.filter(ds => {
              return ds.label === sensorName;

            });
            if(!existingDs || !existingDs.length) {
              result = new DataSet(sensorName,this.getColor(sensorName));
              this.originalChartData.push(result);
            } else {
              result = existingDs[0];
            }
            return result;
          }
          
          d.forEach((row: RawData) => {
            this.seriesLabels.forEach(sensorName => {
              if('measured' !== sensorName && 'gps' !== sensorName) {
                let readTime = Date.parse(row['measured'])
                getDataSetForSensor(sensorName).data.push(new DataSetPoint(readTime, row[sensorName]));
              }
            });
          });
          
          console.log(this.originalChartData);
          this.initCharts(this.filterChartSensorData(this.activeSensors));
          this.blockUI.stop();
        })
      } else {
        this.blockUI.start('Loading...');
      }
    });
    this.filterModel.sensorFilterChangedBus.subscribe((sensorList: string[]) => {
      clearTimeout(this.sensorSelectionChangedTimeout);
      this.sensorSelectionChangedTimeout = setTimeout(() => {this.activeSensors = sensorList},200);
    }); 
  }
  filterChartSensorData(sensorNames: string[]): DataSet[] {
    return this.originalChartData.filter((v:DataSet) => {
      return sensorNames.indexOf(v.name) != -1
    })
  }
  getSensorDetails(s:string) {
    return SensorComponent.sensorList.filter(v =>{return v.value === s;})[0];    
  }
  getSensorList() {
    return SensorComponent.sensorList;
  }
}
