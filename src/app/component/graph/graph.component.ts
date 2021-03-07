import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'node_modules/chart.js'
import { RawData } from 'src/app/model/raw-data';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { DataSet } from './data-set';
import { DataSetPoint } from './data-set-point';
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  myChart: Chart;
  drillStart = 'Hrvatska';
  drillPath: string[] = [];
  isLoadingData = true;
  constructor(private dataStorageService: DataStorageService) { }

  data = {
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

  ngOnInit(): void {
    this.myChart = new Chart("chartCanvas", {
      type: 'line',
      data: {},
      options: {
        scales: {
          xAxes: [{
              type: 'time',
              time: {
                  unit: 'hour'
              }
          }]
      }      
    }
    });
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
              result = new DataSet(sensorName);
              data.push(result);
            } else {
              result = existingDs[0];
            }
            return result;
          }
          d.forEach((row: RawData) => {
            seriesLabels.forEach(sensorName => {
              //if('measured' !== sensorName && 'gps' !== sensorName) {
              if('temp' === sensorName) {
                  getDataSetForSensor(sensorName).data.push(new DataSetPoint(new Date(Date.parse(row['measured'])), row[sensorName]));
              }
            });
          });
          console.log(data);
          let chartData = {datasets: data};
          this.myChart.data = chartData;
          this.myChart.update();

        })
      }
    });
  }
  canvasOnClick(evt: any) {
    var firstPoint = this.myChart.getElementAtEvent(evt)[0];

    if (firstPoint) {
      var label = this.myChart.data.labels[firstPoint._index];
      var value = this.myChart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
      console.log(label);
      console.log(value);
      this.goToLevel(label);
    }
  }
  goToLevel(segmentId: string) {
    let childData = this.data[segmentId];
    if (!!childData) {
      this.myChart.data = childData
      this.myChart.update();
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
