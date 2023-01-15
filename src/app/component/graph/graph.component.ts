import { DataSource } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  ApexYAxis,
  ChartComponent,
  ApexMarkers
} from "ng-apexcharts";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SensorComponent } from '../filter/sensor-filter/sensor.component';
import { FilterModel } from 'src/app/model/filter-model';
import { convertCompilerOptionsFromJson } from 'typescript';

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
  markers: ApexMarkers;
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
  @ViewChild('panChart') panChart: ChartComponent;
  @ViewChild('activeChart') activeChart: ChartComponent;
  // @ViewChild('graphComponent') graphComponent: any;
  fullHeight = document.body.offsetHeight - 25;
  chartWidthReduction = 30;
  @BlockUI() blockUI: NgBlockUI;
  originalChartData: DataSet[] = [];
  seriesLabels: string[]; //using first row to extract sensor names (used to name data series)
  sensorSelectionChangedTimeout;
  activeSensors = [];
  chartData: DataSet[] = [];
  compForm: FormGroup;
  static selectecChartName: string;

  phoneIsVertical = true;
  public panChartConfig: Partial<ChartOptions>[] = []; //for panning
  isBrushTargetChartRendered = false;

  panChartXmin;
  panChartXmax;

  windowHeight;
  windowWidth;

  delayOrientationChange: any;

  panPostion: Array<any> = new Array();

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel, private componenetElem: ElementRef) {
    this.phoneIsVertical = window.innerHeight > window.innerWidth;
    this.windowHeight = window.innerHeight;
  }
  
  // reportWindowSize() {
  //   console.log('innerHeight: ' + window.innerHeight + ', outerHeight: ' + window.outerHeight);
  //   console.log('innerWidth: ' + window.innerWidth + ', outerWidth: ' + window.outerWidth);
  // }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.delayOrientationChange) {
      clearTimeout(this.delayOrientationChange);
    }
    this.delayOrientationChange = setTimeout(this.phoneOriendationChanged, 100); // iPhone will trigger on resize event before updating innerHeight of a window hence a small timeout ;)
    
  }
  phoneOriendationChanged = () => {
    //this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
    this.phoneIsVertical = window.innerHeight > window.innerWidth;
    console.log('isVerticalInner:'+this.phoneIsVertical + 'innerHeight:' + window.innerHeight + 'innerWidth:' + window.innerWidth);
    console.log('isVerticalOuter:'+(window.outerHeight > window.outerWidth) + 'outerHeight:' + window.outerHeight + 'innerWidth:' + window.outerWidth);
    this.windowHeight = this.getChartHeight();
    this.activeChart.updateOptions({
      chart: {
        height : this.phoneIsVertical ? this.windowHeight*0.8 : this.windowHeight - 15
      }
    });
    if (!this.phoneIsVertical) {
      let id = this.activeChart?.chart.id;
      this.panChart?.updateOptions({
        chart: {
          selection: {
            xaxis: { // when phone is horizontal extend pan graph to full and show whole main graph
              min: this.activeSensorXAxisMin(id),
              max: this.activeSensorXAxisMax(id)
            }
          }
        }
      });
    }

  };
  renderChart(chartName: string) {
    return this.activeSensors.indexOf(chartName) !== -1 && this.compForm.value['showChartSelect'] === chartName;
  }
  renderPanChart(d: any): boolean {
    let shouldRenderChart = this.renderChart(d.sensor);
    return this.phoneIsVertical && shouldRenderChart && this.isBrushTargetChartRendered;
  }
  selectChartOnChange(e: any): void {
    this.isBrushTargetChartRendered = false;
    GraphComponent.selectecChartName = e.target.value;
  }
  afterChartRendered = (chartContext: any, config?: any) => {
    if(this.chartConfig[config.config.chart.id]) {
      this.chartConfig[config.config.chart.id].series = [this.chartData[config.config.chart.id]];
      this.panChartConfig[config.config.chart.id].chart.brush.enabled = true;
      this.panChartConfig[config.config.chart.id].chart.brush.target = config.config.chart.id;
      this.panChartConfig[config.config.chart.id].series = [this.chartData[config.config.chart.id]];
      if (this.panChartConfig[config.config.chart.id].chart.selection.xaxis.min === 0) {
        let diff = this.chartData[config.config.chart.id].data[this.chartData[config.config.chart.id].data.length - 1].x - this.chartData[config.config.chart.id].data[0].x;
        diff = diff/3
        this.panChartConfig[config.config.chart.id].chart.selection.xaxis.min = this.chartData[config.config.chart.id].data[0].x + diff;
        this.panChartConfig[config.config.chart.id].chart.selection.xaxis.max = this.chartData[config.config.chart.id].data[this.chartData[config.config.chart.id].data.length - 1].x - diff;
      }
    }
    this.isBrushTargetChartRendered = true; // render paning graph only after main graph is rendered
    this.phoneOriendationChanged();
  }

  activeSensorXAxisMin(sensorName: string): number { // series first point
    if(this.chartData[sensorName]) {
      return this.chartData[sensorName]?.data[0].x
    } else {
      return 0;
    }
  }

  activeSensorXAxisMax(sensorName): number  { // series last point
    if(this.chartData[sensorName]) {
      return this.chartData[sensorName]?.data[this.chartData[sensorName].data.length - 1].x;
    } else {
      return 0;
    }
  }

  beforePannChartRendered = (chartContext: any, config?: any) => {
    //this.panChart.render();
    let id = config.config.chart.brush.target;
    if(this.panChartConfig[id]) {
      //min and max are start and and of series of active graph or stored values of a pan graph (the smaller one)
      let xMin = this.activeSensorXAxisMin(id); 
      let xMax = this.activeSensorXAxisMax(id);
      if(this.brushScrollPositionStored(id)) {
        xMin = this.getBrushScrollPositionXMin(id);
        xMax = this.getBrushScrollPositionXMax(id);
      } else {
        let xDiff = (xMax - xMin)/3 
        xMin = xMin + xDiff;
        xMax = xMax - xDiff;
      }
      this.panChartConfig[id].chart.selection.xaxis.min = xMin;
      this.panChartConfig[id].chart.selection.xaxis.max = xMax;
      this.panChartConfig[id].chart.height = this.windowHeight*0.2
    }
  }
  getChartConfigTemplate(): ChartOptions {
    let configTemplate: ChartOptions  = {
      series: [],
      chart: {
        height : this.windowHeight,
        width : '100%',
        type: "line",
        events: {
          mounted: null
        },
        animations : {enabled: false},
        redrawOnWindowResize: true, // remove this and you get bad display on iPhone in horizontal mode
        redrawOnParentResize: true, // remove this and you get bad display on iPhone in horizontal mode
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
      },
      markers: {
        size: 4,
        radius: 2,
        colors: ['red'],
        strokeColors: 'red',
        fillOpacity: 10,
        shape: 'circle',
        strokeWidth: 10
      }
    };
    return configTemplate;
  }
  rememberBrushScrollPosition = (chartContext: any, newScrollPos: any) => { // remembering pan postition of a smaller graph per main graph
    let chartParts = (chartContext.opts.chart.id as string)?.split('_');
    let chartName = '';
    chartParts.length ? chartName = chartParts[1] : chartName = chartParts[1];
    this.panPostion[chartName] = newScrollPos;
  }
  clearBrushScrollPosions(): void {
    this.panPostion = new Array();
  }
  getBrushScrollPositionXMin(chartName): number {
    return this.panPostion[chartName].xaxis.min;
  }

  getBrushScrollPositionXMax(chartName): number {
    return this.panPostion[chartName].xaxis.max;
  }

  brushScrollPositionStored(chartName): boolean {
    return !!this.panPostion[chartName]
  }

  getPanChart(parentChartName): any {
    let result;
    if (this.panChartConfig[parentChartName]) {
      result = this.panChartConfig[parentChartName]
    } else {
      let configTemplate = {
        series: [],
        chart: {
          height : '200px',
          width : '100%',
          type: "line",
          brush: {
            target: parentChartName,
            enabled: true // see line 86
          },
          selection: {
            enabled: true,
            xaxis: {
              min: 0,
              max: 20
            }
          },
          events: {
            mounted: null
          },
          toolbar: {
            show: false
          }
        },
        colors: ["#008FFB"],
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "straight"
        },
        yaxis: {
          tickAmount: 2
        },
        xaxis: {
          type : 'datetime',
          tooltip: {
            enabled: false
          }
        }
      };
      let chartConfig: Partial<ChartOptions> = JSON.parse(JSON.stringify(configTemplate));
      chartConfig.chart.id = 'panChart_' + parentChartName;
      chartConfig.chart.events.beforeMount = this.beforePannChartRendered;
      chartConfig.chart.events.brushScrolled = this.rememberBrushScrollPosition;
      this.panChartConfig[parentChartName] = chartConfig;
      result = chartConfig;
    }
    return result;
  }
  getChartConfig(chartId: string): ChartOptions {
    let result: ChartOptions;
    if(!this.chartConfig[chartId]) {
        result = JSON.parse(JSON.stringify(this.getChartConfigTemplate()));
        //result.chart.height = 200;
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
      this.chartData = [];
      this.blockUI.stop();
      //return;
    }
    this.chartConfig = [];
    this.panChartConfig = [];
    //this.isBrushTargetChartRendered = false;
    data.forEach((element: any, i:number) => {
      this.chartConfig[element.name] = JSON.parse(JSON.stringify(this.getChartConfigTemplate()));
      this.chartConfig[element.name].chart.id = element.name;
      //this.chartConfig[element.name].chart.height = 300 //Math.trunc((this.fullHeight - 110)/(data.length <= 4 ? data.length : 4))
      this.chartConfig[element.name].title.text = element.name;
      this.chartConfig[element.name].chart.events.mounted = this.afterChartRendered;

      this.chartData[element.name] = element;
      this.getPanChart(element.name);
    });
  }
  initSelectedSensor(): void {
    if (GraphComponent.selectecChartName && this.activeSensors.indexOf(GraphComponent.selectecChartName) !== -1) {
      this.compForm.get('showChartSelect').setValue(GraphComponent.selectecChartName);
    } else {
      this.compForm.get('showChartSelect').setValue(this.activeSensors[0]);
    }
  }
  getChartHeight(): number { // available height for graph is innerHeight minus tool bar height
    let windowHeight = window.innerHeight;
    let toolbarHeight = window.document.getElementById('matToolBar').getBoundingClientRect().height;
    let selectGraphMenuHeight = window.document.getElementById('selectGraphMenu').getBoundingClientRect().height;
    return  windowHeight - toolbarHeight - selectGraphMenuHeight - 10;
  }
  ngAfterViewInit(): void {
    console.log(this.componenetElem.nativeElement.getBoundingClientRect());
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
          this.seriesLabels = d && d.length > 0 && d[0] ? Object.keys(d[0]) : []; //using first row to extract sensor names (used to name data series and set chart id's )
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
          this.initCharts(this.filterChartSensorData(this.getSensorList().map(v => {return v.sensor}))); // fixed sensor list ensures chart population after navigation
          this.blockUI.stop();
        })
      } else {
        this.clearBrushScrollPosions();
        this.isBrushTargetChartRendered = false; // this line fixes error reading w when no data is available
        this.blockUI.start('Loading...');
      }
    });
    this.filterModel.sensorFilterChangedBus.subscribe((sensorList: string[]) => { // only checked sensors are in the dropdown menu
      clearTimeout(this.sensorSelectionChangedTimeout);
      this.sensorSelectionChangedTimeout = setTimeout(() => {
        this.activeSensors = sensorList.filter(v => {
          return !this.getSensorDetails(v).hidden;
        });
        this.initSelectedSensor();
      }, 200);
    });
    this.compForm = new FormGroup({
      showChartSelect: new FormControl('')
    })
    
  }
  filterChartSensorData(sensorNames: string[]): DataSet[] {
    return this.originalChartData.filter((v:DataSet) => {
      return sensorNames.indexOf(v.name) != -1
    })
  }
  getSensorDetails(s:string) {
    return SensorComponent.sensorList.filter(v =>{return v.sensor === s;})[0];
  }
  getSensorList() {
    return SensorComponent.sensorList;
  }

}
