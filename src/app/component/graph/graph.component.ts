import { DataSource } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'node_modules/chart.js'
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { DataSet } from './data-set';
import { DataSetPoint } from './data-set-point';
import {
  ChartComponent,
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
import { DatePipe } from '@angular/common';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

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
  fullHeight = document.body.offsetHeight - 45;
  @BlockUI() blockUI: NgBlockUI;

  afterChartRendered = (chartContext: any, config?: any) => {
    //console.log(chartContext);
    //console.log(config.globals.chartID);
    this.chartConfig.forEach(value => {
      if (value.chart.id === config.config.chart.id) {
        setTimeout(() => {value.series = [this.chartData[value.chart.id]]},300); //setTimeout to allow navigation to occur
      }
    });
  }
  chartData: DataSet[] = [];

  initCharts(data: DataSet[]) {
    if(!data || data.length == 0) {
      this.chartConfig.forEach(ch => {
        ch.series = [];
      })
      return;
    }
    let configTemplate: ChartOptions  = {
      series: [],
      chart: {
        height : document.body.offsetHeight/7,
        width : document.body.offsetWidth/2 - 40,
        type: "line",
        group: 'aqi',
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true
        },
        events: {
          mounted: null
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "",
        align: "center"
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
          format: 'dd.MM.yyyy HH:mm:ss'
        }
      }

    };
    data.forEach((element: any, i:number) => {
      //if(i > 0) return;
      this.chartConfig[i] = JSON.parse(JSON.stringify(configTemplate));
      this.chartConfig[i].chart.id = element.name;
      this.chartConfig[i].title.text = element.name;
      this.chartConfig[i].chart.events.mounted = this.afterChartRendered;

      this.chartData[element.name] = element;
    });
  }

  constructor(private dataStorageService: DataStorageService) { 
  }

  ngOnInit(): void {

  }
  getColor(colorIndex: number): string { 
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
                'rgb(0, 255, 153)']
    if(colorIndex < colors.length) {
      result = colors[colorIndex];
    } else {
      result = 'rgba('+Math.round((Math.random()*255))+','+(Math.random()*255)+','+(Math.random()*255)+','+'0.3)';
    }
    return result;
  }

  ngAfterViewInit(): void {
    let colorIndex = 0;
  //this.goToLevel(this.drillStart);
    this.dataStorageService.loadingStatusBus.subscribe((isLoadingData : boolean) => { //this subscription ensures only all data is sent to graph
      this.isLoadingData = isLoadingData;
      if(!isLoadingData) {
        this.dataStorageService.availableDataBus.subscribe((d :RawData[]) => {
          if(this.isLoadingData) {
            return;
          }
          console.log(d);
          let data: DataSet[] = [];
          let seriesLabels = d.length > 0 ? Object.keys(d[0]) : []; //using first row to extract sensor names (used to name data series)

          let getDataSetForSensor = (sensorName: string): DataSet  => { //returns new/existing data set for sensor name
            let result;
            let existingDs = data.filter(ds => {
              return ds.label === sensorName;

            });
            if(!existingDs || !existingDs.length) {
              result = new DataSet(sensorName,this.getColor(colorIndex++));
              data.push(result);
            } else {
              result = existingDs[0];
            }
            return result;
          }
          d.forEach((row: RawData) => {
            seriesLabels.forEach(sensorName => {
              if('measured' !== sensorName && 'gps' !== sensorName) {
                let readTime = Date.parse(row['measured'])
                getDataSetForSensor(sensorName).data.push(new DataSetPoint(readTime, row[sensorName]));
              }
            });
          });
          
          console.log(data);
          this.initCharts(data);
          this.blockUI.stop();
        })
      } else {
        this.blockUI.start('Loading...');
      }
    });
  }
}
