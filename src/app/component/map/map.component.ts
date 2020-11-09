import { Component, OnDestroy, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { Draw, Modify, Select, Snap } from 'ol/interaction';
//import {OSM, Vector as VectorSource} from 'ol/source';
import {OSM} from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Feature from 'ol/Feature';
//import TileLayer from 'ol/layer/Tile';
//import {Style, Stroke, Fill, Circle} from 'ol/style';
import XYZSource from 'ol/source/XYZ';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
//import VectorLayer from 'ol/layer/Vector';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
//import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Region } from 'src/app/model/region';
import { BehaviorSubject } from 'rxjs';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { RawData } from 'src/app/model/raw-data';
import { FilterModel } from 'src/app/model/filter-model';
import { easeIn, easeOut, inAndOut, linear, upAndDown } from 'ol/easing';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  private static pointId = 0;
  private static clearMapService: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  static RADIUS_FACTOR: number = 0.68681318;
  projection = "EPSG:3857";
  subscription;
  map: Map;
  tileLayer: TileLayer;
  vectorLayer: VectorLayer;
  gJson = new GeoJSON();
  raster = new TileLayer({
    source: new OSM(),
  });
  raster0 = new TileLayer({
    source: new XYZSource({
      //url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
    })
  });

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

  styleFunction = (feature) => {
    return this.styles[feature.get("selected") ? "SelectedPoint" : feature.getGeometry().getType()];
  };
  sourceFeatures = new VectorSource({ wrapX: false });
  sourcePoints = new VectorSource({wrapX: false});
  vectorFeatures = new VectorLayer({
    source: this.sourceFeatures,
    style: this.styleFunction,
  });
  vectorPoints = new VectorLayer({
    source: this.sourcePoints,
    style: this.styleFunction,
  });

  drawPolygon = new Draw({
    source: this.sourceFeatures,
    type: "Polygon",
  });

  drawCircle = new Draw({
    source: this.sourceFeatures,
    type: "Circle",
  });

  modify = new Modify({source: this.sourceFeatures});
  snap = new Snap({source: this.sourceFeatures});

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }

  ngOnDestroy(): void {
    this.unsubscribeData();
    const center = this.map.getView().getCenter();
    localStorage.setItem('center0', center[0]);
    localStorage.setItem('center1', center[1]);
    localStorage.setItem('zoom', this.map.getView().getZoom());
  }

  clearPoints() {
    this.vectorPoints.getSource().clear();
  }

  clearFeatures() {
    this.vectorFeatures.getSource().clear();
  }

  clearMap() {
    this.clearPoints();
    this.clearFeatures()
  }

  static regionToGeoJSON(r: Region[]): GeoJSONFeature[] {
    return r.map((v: Region) => {
      const feature = {type:"Feature", id:v.id, geometry:{type:v.gtype, coordinates:v.coordinates}};
      feature.geometry.coordinates = this.geometryLonLat(feature);
      return feature;
    });
  }

  static rawDataToGeoJSON(r: RawData[]): GeoJSONFeature[] {
    return r?.map((v: RawData) => {
      MapComponent.pointId++
      const feature = {type:"Feature", id:(MapComponent.pointId + ''), geometry:{type:"Point", coordinates:v.gps}};
      feature.geometry.coordinates = this.geometryLonLat(feature);
      return feature;
    });
  }

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
            layers: [this.raster, this.vectorFeatures, this.vectorPoints],      
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
              projection: this.projection,
              center: [localStorage.getItem('center0'), localStorage.getItem('center1')] || fromLonLat([0, 0]),
              zoom: localStorage.getItem('zoom') || 0
            })
          });
          resolve();
        }, 1);
      });
  }

  changeInteraction(locations: any) {
    this.drawPolygon.setActive(false);
    this.drawCircle.setActive(false);
    if (locations && locations.polygon) {
      this.drawPolygon.setActive(true);
    }
    if (locations && locations.circle) {
      this.drawCircle.setActive(true);
    }
  }

  createFeaturesFromLocation = ()  => {
    this.clearFeatures();
    console.log("location:", this.filterModel);

    if (this.filterModel.locations && this.filterModel.locations.polygon && this.filterModel.locations.polygon.length) {
      const polygonFeature = new Feature({
        geometry: new Polygon([this.filterModel.locations.polygon.map(p => fromLonLat(p))])
      });
      this.vectorFeatures.getSource().addFeature(polygonFeature);
    }

    if (this.filterModel.locations && this.filterModel.locations.circle && this.filterModel.locations.circle.radius) {
      const circle = this.filterModel.locations.circle;
      const circleFeature = new Feature({
        geometry: new Circle(fromLonLat(circle.center), circle.radius / MapComponent.RADIUS_FACTOR)
      });
      this.vectorFeatures.getSource().addFeature(circleFeature);
    }
  }

  createLocationFromFeature = (feature: any) => {
    if (this.filterModel.locations && this.filterModel.locations.polygon) {
      const gPolygon = feature.getGeometry();
      const coordinates = gPolygon.getCoordinates()[0].map(p => toLonLat(p));
      const polygon = { polygon: coordinates };
      this.filterModel.locations = polygon;
    }
    if (this.filterModel.locations && this.filterModel.locations.circle) {
      const gCircle = feature.getGeometry();
      const center = toLonLat(gCircle.getCenter());
      const radius = gCircle.getRadius() * MapComponent.RADIUS_FACTOR;
      const circle = { circle: { center, radius }}; 
      this.filterModel.locations = circle;
    }
  }

  drawStart = () => this.clearFeatures();

  drawEnd = (event: any) => {
    this.createLocationFromFeature(event.feature);
    if (this.filterModel.locations && (this.filterModel.locations.polygon || this.filterModel.locations.circle)) {
      this.fetchData();
    }
  }

  async ngOnInit() {
    await this.initMap(this);
    this.filterModel.locationsSubject.subscribe(value => {
      console.log("filterModel changed to:", value);
      this.createFeaturesFromLocation();

      this.changeInteraction(value);
      this.modify.setActive(value.polygon || value.circle);
    });
    this.dataStorageService.drawDataBus.subscribe((region: any) => {
      console.log("named location:", region);
      if (!region) {
        return;
      }
      let geometry;
      if (region[0].gtype == "Polygon") {
        const coords = region[0].coordinates[0].map(p => fromLonLat(p));
        console.log("coords:", coords);
        geometry = new Polygon([coords])
        console.log("polygon created");
      } else if (region[0].gtype == "Circle") {
        geometry = new Circle(fromLonLat(region[0].center), region[0].radius / MapComponent.RADIUS_FACTOR)
      }
      const feature = new Feature({ geometry });
      console.log("feature created");
      this.vectorFeatures.getSource().addFeature(feature);
      console.log("feature added");
      //this.map.getView().fit(feature.getGeometry(), { padding: [100, 100, 100, 100], duration: 2000, easing: easeOut });
      this.map.getView().fit(feature.getGeometry(), { padding: [100, 100, 100, 100], duration: 2000, easing: inAndOut });
      //this.map.getView().fit(feature.getGeometry(), { padding: [100, 100, 100, 100], duration: 2000, easing: upAndDown });
    });
    this.map.addInteraction(this.modify);
    this.modify.setActive(false);
    this.drawPolygon.setActive(false);
    this.drawCircle.setActive(false);
    this.map.addInteraction(this.drawPolygon);
    this.map.addInteraction(this.drawCircle);
    this.drawPolygon.on('drawstart', this.drawStart);
    this.drawPolygon.on('drawend', this.drawEnd);
    this.drawCircle.on('drawstart', this.drawStart);
    this.drawCircle.on('drawend', this.drawEnd);
    /*
    this.drawPolygon.on('drawstart', (event) => {
      console.log('drawstart:', event);
      this.removeLastFeature();
    }, this);
    this.drawPolygon.on('drawend', (event) => {
      console.log('drawend:', event);
      this.lastFeature = event.feature;
    }, this);
    this.vector.getSource().on('addfeature', function(event){
      console.log('addfeature:', event);
    });
     */
    this.vectorFeatures.getSource().on('changefeature', (event) => {
      this.drawEnd(event);
    });
    this.map.addInteraction(this.snap);

    this.dataStorageService.loadingStatusBus.subscribe((isLoading: boolean) =>{
      if(isLoading) {
        this.clearPoints();
      }
    });
    this.subscribeData();
  }

  fetchData() {
    this.subscribeData();
    this.subscription = this.dataStorageService.fetchData();
  }

  unsubscribeData() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  subscribeData() {
    this.unsubscribeData();
    this.dataStorageService.pageOfDataBus
      .subscribe((data: RawData[]) => {
      this.draw(this.vectorPoints, MapComponent.rawDataToGeoJSON(data));
    });
  }

  draw(vector: any, r: GeoJSONFeature[]) {
    r?.forEach((r: GeoJSONFeature, index: number) => {
      if (!!r && !!this.map) {
        const gs = new GeoJSON();
        const feature = gs.readFeature(r);
        if (vector === this.vectorPoints) {
          feature.set('selected', index == 2); // TODO: replace this with selected row in rawData
        }
        //this.map.getLayers().getArray()[1].getSource().addFeature(feature);
        vector.getSource().addFeature(feature);
        //console.log(this.map.getLayers().getArray()[1].getSource().getFeatures().toString());
  
        //this.map.getView().fit(this.map.getLayers().getArray()[1].getSource().getExtent(), {maxZoom: 13}); //to show new polygon
        //this.map.getView().fit(this.vectorPoints.getSource().getExtent(), {maxZoom: 13}); //to show new polygon
      }  
    });
  }
  /**
   * 
   * @param 
   * be aware of the outer square bracket!
   * let source = [[13.5131836, 45.6370871],[14.3591309, 45.5986657]];
   * let fliped = [fromLonLatToggle(source)] //notice the added square bracket to the function result
   */
  static fromLonLatToggle(c: any[]): any[]  {
    return c.map((v) => fromLonLat(v));
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
