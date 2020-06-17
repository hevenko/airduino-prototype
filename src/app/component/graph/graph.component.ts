import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'node_modules/chart.js'
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  myChart: Chart;
  drillStart = 'Hrvatska';
  drillPath: string[] = [];

  constructor() { }

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
      type: 'bar',
      data: {},
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
    this.goToLevel(this.drillStart);
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
