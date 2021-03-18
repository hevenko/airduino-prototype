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
  filteredChartData: DataSet[] = [];
  seriesLabels: string[]; //using first row to extract sensor names (used to name data series)
  compForm: FormGroup;
  sensorSelectionChangedTimeout;

  constructor(private dataStorageService: DataStorageService) { 
    this.initSelectSensorsForm([]);
  }

  afterChartRendered = (chartContext: any, config?: any) => {
    //console.log(chartContext);
    //console.log(config.globals.chartID);
    this.chartConfig.forEach(value => {
      if (value.chart.id === config.config.chart.id) {
        setTimeout(() => {
          let chartSeries = this.chartData[value.chart.id];
          chartSeries.color  = this.getColor(value.chart.id);
          value.series = [chartSeries]}
          ,300); //setTimeout to allow navigation to occur
      }
    });
  }
  chartData: DataSet[] = [];

  showCharts(data: DataSet[]) {
    if(!data || data.length == 0) {
      this.chartConfig.forEach(ch => {
        ch.series = [];
      })
      this.blockUI.stop();
      return;
    }
    let configTemplate: ChartOptions  = {
      series: [],
      chart: {
        height : Math.trunc((this.fullHeight - 110)/(data.length <= 4 ? data.length : 4)),
        width : document.body.offsetWidth - this.chartWidthReduction,
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
    this.chartConfig = [];
    data.forEach((element: any, i:number) => {
      //if(i > 0) return;
      this.chartConfig[i] = JSON.parse(JSON.stringify(configTemplate));
      this.chartConfig[i].chart.id = element.name;
      this.chartConfig[i].title.text = element.name;
      this.chartConfig[i].chart.events.mounted = this.afterChartRendered;

      this.chartData[element.name] = element;
    });
    // if(this.chartConfig.length > 0 ) {
    //   let dummyInd = JSON.parse(JSON.stringify(this.chartConfig.length));
    //   this.chartConfig[dummyInd] = JSON.parse(JSON.stringify(configTemplate));
    //   this.chartConfig[dummyInd].chart.id = 'aqi';
    //   this.chartConfig[dummyInd].title.text = 'aqi (dummy)';
    //   this.chartConfig[dummyInd].chart.events.mounted = this.afterChartRendered;
  
    //   let aqiFirst = [];//aqi chart fist in the list
    //   aqiFirst[0] = this.chartConfig[dummyInd];
    //   aqiFirst = aqiFirst.concat(this.chartConfig.slice(0, this.chartConfig.length -1));
    //   this.chartConfig = aqiFirst;
    //   this.chartData['aqi'] = data[0];
    // }
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
  //this.goToLevel(this.drillStart);
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
          this.seriesLabels = d && d.length > 0 ? Object.keys(d[0]) : []; //using first row to extract sensor names (used to name data series)
          this.seriesLabels = this.seriesLabels.filter(v => {return v != 'measured' && v != 'gps'})
          this.initSelectSensorsForm(this.seriesLabels);
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
          this.sensorSelectionChanged();
          this.blockUI.stop();
        })
      } else {
        this.blockUI.start('Loading...');
      }
    });
  }
  sensorSelectionChanged = () => {
    this.showCharts(this.filterChartSensorData(this.getCheckedSensors()));
  }
  filterChartSensorData(sensorNames: string[]): DataSet[] {
    return this.originalChartData.filter((v:DataSet) => {
      return sensorNames.indexOf(v.name) != -1
    })
  }
  initSelectSensorsForm(sensorList: string[]) {
    if(!this.compForm) {
      const faSensors: FormArray = new FormArray([]);
      for (const def of SensorComponent.sensorList) {
        faSensors.push(new FormControl(false));
      }
      this.compForm = new FormGroup({
        sensors: faSensors
      })
  
    }
    SensorComponent.sensorList.forEach((v, i) => {
      if(sensorList.indexOf(v.value) === -1) {
        this.getSensorControls()[i].disable({emitEvent: false}); // event would cause repeated graphs repaint
        this.getSensorControls()[i].setValue(false, {emitEvent: false});
      } else {
        this.getSensorControls()[i].enable({emitEvent: false}); // event would cause repeated graphs repaint
        this.getSensorControls()[i].setValue(true, {emitEvent: false});
      }
    })
    this.compForm.valueChanges.subscribe(() => {
      clearTimeout(this.sensorSelectionChangedTimeout);
      this.sensorSelectionChangedTimeout = setTimeout(this.sensorSelectionChanged, 2000)
    });
}
  getSensorControls() {
    let sensors = this.compForm.get('sensors') as FormArray;
    return sensors ? sensors.controls : [];
  }
  getCheckedSensors(): string[] {
    let result = [];
    result = this.compForm.value.sensors
      .map((v, i) => (v ? this.seriesLabels[i] :  null))
      .filter(v => v !== null);
       
    return !!result ? result : null;
  }
  getSensorDetails(s:string) {
    return SensorComponent.sensorList.filter(v =>{return v.value === s;})[0];    
  }
  getSensorList() {
    return SensorComponent.sensorList;
  }
}
