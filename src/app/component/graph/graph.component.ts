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
  ApexGrid
} from "ng-apexcharts";
import { DatePipe } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  chart: Chart;
  drillStart = 'Hrvatska';
  drillPath: string[] = []; 
  isLoadingData = true;
  public chartOptions: Partial<ChartOptions>[] = [];
  @ViewChild('graphComponent') graphComponent: any;
  chartTypes = ['chart.js', 'apexchart'];
  whichChart = this.chartTypes[1];
  fullHeight = document.body.offsetHeight - 45;
  
  initCharts(data: DataSet[]) {
    if(!data || data.length == 0) return;
    
    let configTemplate = {
      series: [],
      chart: {
        height : document.body.offsetHeight/7,
        width : document.body.offsetWidth/2 - 40,
        type: "line",
        group: 'aqi',
        zoom: {
          type: "x",
          enabled: false,
          autoScaleYaxis: true
        },
        // toolbar: {
        //   autoSelected: "pan",
        //   show: false
        // }
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
        labels: {show : false}
      }
    };
    data.forEach((element: any, i:number) => {
      //if(i > 0) return;
      this.chartOptions[i] = JSON.parse(JSON.stringify(configTemplate));
      this.chartOptions[i].chart.id = element.name;
      this.chartOptions[i].series = [element];
      this.chartOptions[i].title.text = element.name;
      this.chartOptions[i].chart.zoom. enabled = true;
    });
    //this.chartOptions = this.addPanChart(0, this.chartOptions);
  }
  addPanChart(panTargetChartInd :number, charts: Partial<ChartOptions>[]): Partial<ChartOptions>[] {
    let result: Partial<ChartOptions>[] = [];
    let panTargetChartIdInd = panTargetChartInd;
    let configTemplate = {
      series: [],
      chart: {
        height : document.body.offsetHeight/7,
        width : document.body.offsetWidth/2 - 40,
        type: "line",
        group: 'aqi',
        brush: {
          target: "",
          enabled: true
        },
        selection: {
          enabled: true
        }        
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      yaxis: {
        labels: {
          minWidth: 40
        }
      },
      xaxis: {
        labels: {show : false}
      }
    };
    let chartForPaning: Partial<ChartOptions> = JSON.parse(JSON.stringify(configTemplate));
    chartForPaning.chart.id = 'panChart';
    chartForPaning.series = JSON.parse(JSON.stringify(charts[panTargetChartIdInd].series));
    chartForPaning.chart.brush.target = charts[panTargetChartIdInd].chart.id;
    chartForPaning.chart.brush.enabled = true;
    result = charts.slice(0, panTargetChartIdInd+1);
    result.push(chartForPaning);
    if((panTargetChartIdInd+1) < charts.length ) {
      result = result.concat(charts.slice(panTargetChartIdInd+1));
    }
    return result;
  }
  constructor(private dataStorageService: DataStorageService) { 
  }
  ngAfterViewInit(): void {

  }

  

  dummyData = {
    Hrvatska: {
      labels: ['Zagreb', 'Varaždin'],
      datasets: [{
        label: 'AQI',
        data: [12, 19, 3],
        backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Zagreb: {
      labels: ['Dugave', 'Črnomerac', 'Trnsko'],
      datasets: [{
        label: 'AQI',
        data: [12, 19, 3],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Dugave: {
      labels: ['PM10', 'PM25', 'S02'], datasets: [{
        label: 'Dugave', data: [3, 19, 12],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Črnomerac: {
      labels: ['PM10', 'PM25', 'S02'], datasets: [{
        label: 'Črnomerac', data: [9, 6, 3],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Trnsko: {
      labels: ['PM10', 'PM25', 'S02'], datasets: [{
        label: 'Trnsko', data: [5, 3, 1],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Varaždin: {
      labels: ['Banfica', 'Bronx', 'Đurek'],
      datasets: [{
        label: 'AQI',
        data: [12, 19, 3],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Banfica: {
      labels: ['PM10', 'PM25', 'S02'], datasets: [{
        label: 'Banfica', data: [12, 19, 3],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Bronx: {
      labels: ['PM10', 'PM25', 'S02'], datasets: [{
        label: 'Bronx', data: [3, 6, 9],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    Đurek: {
      labels: ['PM10', 'PM25', 'S02'], datasets: [{
        label: 'Đurek', data: [1, 3, 5],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    }
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
  initApexChart(data: DataSet[]) {
    let s =   [{
      name: "series A",
      data: [{
          x: "2018-09-10",
          y: 120
        }, {
          x: "2018-09-11",
          y: 480
        }, {
          x: "2018-09-12",
          y: 330
        }]
      }, {
        name: "series B",
        data: [{
          x: "2018-09-10",
          y: 112
        }, {
          x: "2018-09-11",
          y: 321
        }, {
          x: "2018-09-12",
          y: 443
        }]
      }  
    ]
    let s1 = {
      name: "Desktops",
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    };
    this.chartOptions[0].series = data;
    this.chartOptions[1].series = data;
    this.chartOptions[2].series = data;
  }
  ngOnInit(): void {
    let colorIndex = 0;
    if(this.whichChart === this.chartTypes[0]) {
      this.chart = new Chart("chartCanvas", {
        type: 'line',
        data: {},
        options: {
          scales: {
            xAxes: [{
                type: 'time',
                distribution: 'series'
            }],
            yAxes: [{
              display: true,
              type: 'logarithmic',
            }]
        }      
      }
      });  
    }
    //this.goToLevel(this.drillStart);
    this.dataStorageService.loadingStatusBus.subscribe((isLoadingData : boolean) => { //this subscription ensures only all data is sent to graph
      this.isLoadingData = isLoadingData;
      if(!isLoadingData) {
        this.dataStorageService.availableDataBus.subscribe((d :RawData[]) => {
          if(!d || !d.length || this.isLoadingData) return;
          console.log(d);
          let data: DataSet[] = [];
          let seriesLabels = Object.keys(d[0]); //using first row to extract sensor names (used to name data series)

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
              //if('temp' === sensorName) {
                let readTime = this.whichChart === this.chartTypes[1] ? new DatePipe('en_US').transform(row['measured'],"dd.MM.yyyy, hh:mm:ss") : new Date(Date.parse(row['measured']));
                getDataSetForSensor(sensorName).data.push(new DataSetPoint(readTime, row[sensorName]));
              }
            });
          });
          
          console.log(data);
          if(this.whichChart === this.chartTypes[0]) {
            let chartData = {datasets: data};
            this.chart.data = chartData;
            this.chart.update();
  
          } else if(this.whichChart === this.chartTypes[1]) {
            this.initCharts(data);
            //this.initApexChart(data);
          }
        })
      }
    });
  }
  canvasOnClick(evt: any) {
    var firstPoint = this.chart.getElementAtEvent(evt)[0];

    if (firstPoint) {
      var label = this.chart.data.labels[firstPoint._index];
      var value = this.chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
      console.log(label);
      console.log(value);
      this.goToLevel(label);
    }
  }
  goToLevel(segmentId: string) {
    let childData = this.dummyData[segmentId];
    if (!!childData) {
      this.chart.data = childData
      this.chart.update();
      let segmentIndex = this.drillPath.indexOf(segmentId);
      if (segmentIndex === -1) {
        this.drillPath.push(segmentId);
      } else {
        let childIndex = segmentIndex + 1;
        if (childIndex < this.drillPath.length) {
          this.drillPath.splice(childIndex);
        } else {
          let parentIndex = segmentIndex - 1;
          if(parentIndex > -1) {
            this.goToLevel(this.drillPath[parentIndex]);
          }

        }
      }
      return true;
    }
    return false;
  }
}
