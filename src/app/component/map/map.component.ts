import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: Map;
  constructor() { }


  initMap(ctx) {
    return new Promise(function (resolve) {
        setTimeout(() => { // without setTimeout map is empty
          var customCondition = function (mapBrowserEvent) {
            console.log(mapBrowserEvent);
            return false; // TODO
          };
          ctx.map = new Map({
            interactions: defaultInteractions().extend([
              new DragRotateAndZoom({ condition: customCondition })
            ]),
            layers: [
              new TileLayer({
                source: new OSM()
              })
            ],
            target: 'map',
            view: new View({
              center: [200, 200],
              zoom: 2
            })
          });
          console.log('before')

          resolve();
        }, 1);
      });
  }
   async ngOnInit() {
     await this.initMap(this);
    console.log('after');
    
  }
}
