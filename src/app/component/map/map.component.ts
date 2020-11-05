import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import {Draw, Modify, Select, Snap} from 'ol/interaction';
import {OSM, Vector as VectorSource} from 'ol/source';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
//import TileLayer from 'ol/layer/Tile';
//import {Style, Stroke, Fill, Circle} from 'ol/style';
import XYZSource from 'ol/source/XYZ';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
//import VectorLayer from 'ol/layer/Vector';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
//import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import { Region } from 'src/app/model/region';
import { BehaviorSubject } from 'rxjs';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { GeoJSONGeometry } from 'src/app/model/geo-json-geometry';
import { RawData } from 'src/app/model/raw-data';
import { features } from 'process';
import { FilterModel } from 'src/app/model/filter-model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private static pointId = 0;
  private static deleteMapService: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  map: Map;
  tileLayer: TileLayer;
  vectorLayer: VectorLayer;
  gJson = new GeoJSON();
  styles = {
    'Point': new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 0.4)',
        }),
      }),
    }),
    'SelectedPoint': new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
        stroke: new Stroke({
          color: '#17920e',
          width: 2,
        }),
      }),
    }),
    'Polygon': new Style({
      stroke: new Stroke({
        color: 'rgba(0, 0, 255, 0.5)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',
      }),
    }),
    'Circle': new Style({
      stroke: new Stroke({
        color: 'rgba(0, 0, 255, 0.5)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',
      }),
    }),
  };

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { 
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
    return this.deleteMapService.next(true);
  }
  static regionToGeoJSON(r: Region[]): GeoJSONFeature[] {
    return r.map((v: Region) => {
      const feature = {type:"Feature", id:v.id, geometry:{type:v.gtype, coordinates:v.coordinates}};
      feature.geometry.coordinates = this.geometryLonLat(feature);
      return feature;
    });
  }
  static rawDataToGeoJSON(r: RawData[]): GeoJSONFeature[] {
    return r.map((v: RawData) => {
      MapComponent.pointId++
      const feature = {type:"Feature", id:(MapComponent.pointId + ''), geometry:{type:"Point", coordinates:v.gps}};
      feature.geometry.coordinates = this.geometryLonLat(feature);
      return feature;
    });
  }
  styleFunction = (feature) => {
    return this.styles[feature.get("selected") ? "SelectedPoint" : feature.getGeometry().getType()];
  };

  raster = new TileLayer({
    source: new OSM(),
  });
  source = new VectorSource({wrapX: false});
  vector = new VectorLayer({
    source: this.source,
    style: this.styleFunction,
  });

  initMap(ctx) {
    return new Promise((resolve) => {
        setTimeout(() => { // without setTimeout map is empty
          const customCondition = function (mapBrowserEvent) {
            console.log(mapBrowserEvent);
            return false; // TODO
          };

          ctx.map = new Map({
            interactions: defaultInteractions().extend([
              new DragRotateAndZoom({ condition: customCondition })
            ]),      
            layers: [this.raster, this.vector],      
            /*
            layers: [
              new TileLayer({
                source: new XYZSource({
                  url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
                })
              }),
              new VectorLayer({
                source: new VectorSource(),
                style: this.styleFunction,
              })
            ],
            */
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

  drawPolygon = new Draw({
    source: this.source,
    type: "Polygon",
  });
  drawCircle = new Draw({
    source: this.source,
    type: "Circle",
  });
  snap = new Snap({source: this.source});
  lastFeature;

  changeInteraction(type: string) {
    this.drawPolygon.setActive(false);
    this.drawCircle.setActive(false);
    if (type === "Polygon") {
      this.drawPolygon.setActive(true);
    }
    if (type === "Circle") {
      this.drawCircle.setActive(true);
    }
  }

  removeLastFeature() {
    if(this.lastFeature) {
      this.vector.getSource().removeFeature(this.lastFeature);
      this.lastFeature = null;
    }
  }

  async ngOnInit() {
    this.filterModel.locationsSubject.subscribe(value => {
      console.log("filterModel changed to:", value);
      this.removeLastFeature();
      this.changeInteraction(value);
    });
    await this.initMap(this);
    const modify = new Modify({source: this.source});
    this.map.addInteraction(modify);
    this.drawPolygon.setActive(false);
    this.drawCircle.setActive(false);
    this.map.addInteraction(this.drawPolygon);
    this.map.addInteraction(this.drawCircle);
    this.drawPolygon.on('drawstart', (event) => {
      console.log('drawstart:', event);
      this.removeLastFeature();
    }, this);
    this.drawPolygon.on('drawend', (event) => {
      console.log('drawend:', event);
      this.lastFeature = event.feature;
    }, this);
    this.drawCircle.on('drawstart', (event) => {
      console.log('drawstart:', event);
      this.removeLastFeature();
    }, this);
    this.drawCircle.on('drawend', (event) => {
      console.log('drawend:', event);
      this.lastFeature = event.feature;
    }, this);
    this.vector.getSource().on('addfeature', function(event){
      console.log('addfeature:', event);
    });
    this.vector.getSource().on('changefeature', (event) => {
      console.log('changefeature:', event);
    });
    this.map.addInteraction(this.snap);

    //subscribing to device list
    this.dataStorageService.drawDataBus.subscribe((geoJsonFeature: GeoJSONFeature[]) => {
      this.draw(geoJsonFeature);
    });
    this.dataStorageService.mapDataBus.subscribe((data: RawData[]) => {
      //MapComponent.deleteMap();
      this.draw(MapComponent.rawDataToGeoJSON(data));
    });
  }

  draw(r:GeoJSONFeature[]) {
    r?.forEach((r: GeoJSONFeature, index: number) => {
      if (!!r && !!this.map) {
        const gs = new GeoJSON();
        const feature = gs.readFeature(r);
        feature.set('selected', index == 2); // TODO: replace this with selected row in rawData
        this.map.getLayers().getArray()[1].getSource().addFeature(feature);
        //console.log(this.map.getLayers().getArray()[1].getSource().getFeatures().toString());
  
        this.map.getView().fit(this.map.getLayers().getArray()[1].getSource().getExtent(), {maxZoom: 13}); //to show new polygon
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
  static fromLonLatToggle(c:any[]): any[]  {
    return c.map((v)=>{return fromLonLat(v)});
  }

  static geometryLonLat(g: any): any {
    if ((g.geometry.type.toUpperCase() === 'MULTIPOLYGON')) {
      return [[this.fromLonLatToggle(g.geometry.coordinates[0][0])]];
    } else if ((g.geometry.type.toUpperCase() === 'POLYGON')) {
      return [this.fromLonLatToggle(g.geometry.coordinates[0])];
    } else { // POINT
      return this.fromLonLatToggle([g.geometry.coordinates])[0];
    }
  }
}
