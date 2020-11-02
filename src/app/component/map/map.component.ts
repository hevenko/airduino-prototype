import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import { Region } from 'src/app/model/region';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private static deleteMapService: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  map: Map;
  tileLayer: TileLayer;
  vectorLayer: VectorLayer;
  gJson = new GeoJSON();

  constructor(private dataStorageService: DataStorageService) { 
    MapComponent.deleteMapService.subscribe((v: boolean) => {
      if (!!this.map) {
        this.map.getLayers().getArray()[1].getSource().clear(); //clear map
        this.map.getView().setZoom(0);
      }
    });
  }
  /**
   * usage example:
   * MapComponent.deleteMap()
   */
  static deleteMap(): void {
    this.deleteMapService.next(true);
  }
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
                source: new XYZSource({
                  url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
                })
              }),
              new VectorLayer({
                source: new VectorSource()
              })
            ],
            target: 'map',
            view: new View({
              center: fromLonLat([0, 0]),
              zoom: 0
            })
          });
          resolve();
        }, 1);
      });
  }
   async ngOnInit() {
    await this.initMap(this);

    //subscribing to device list
    this.dataStorageService.drawDataBus.subscribe((geoJsonFeature: Region[]) => {
      this.draw(geoJsonFeature);
    });
  }
  draw(r:Region[]) {
    r?.forEach((r: Region) => {
      if (!!r && !!this.map) {
        //let geoJsonFeature = {"type":"Feature","id":r.id,"geometry":{"type":r.gtype,"coordinates":r.coordinates}}
        let geoJsonFeature = {"type":"Feature","id":r.id,"geometry":{"type":"Point","coordinates":[4e6, -5e6]}}
        let d = JSON.parse(JSON.stringify(geoJsonFeature));
        d.geometry.coordinates = this.geometryLonLat(d);
        let gs = new GeoJSON();
        let feature = gs.readFeature(d);
        this.map.getLayers().getArray()[1].getSource().addFeature(feature);
  
        this.map.getView().fit(feature.getGeometry(), {maxZoom: 10}); //to show new polygon
      }  
    });
}
  /**
   * 
   * @param 
   * be aware of the outer square bracket!
   * let source = [[[13.5131836, 45.6370871],[14.3591309, 45.5986657]]];
   * let fliped = [fromLonLatToggle(source[0])] //notice the added square bracket to the function result
   */
  fromLonLatToggle(c:any[]): any[]  {
    return c.map((v)=>{return fromLonLat(v)});
  }
  geometryLonLat(g: any): any {
    if ((g.geometry.type.toUpperCase() === 'MULTIPOLYGON')) {
      return [[this.fromLonLatToggle(g.geometry.coordinates[0][0])]];
    } else if ((g.geometry.type.toUpperCase() === 'POLYGON')) {
      return [this.fromLonLatToggle(g.geometry.coordinates[0])];
    } else {
      return this.fromLonLatToggle(g.geometry.coordinates);
    }
  }
}
