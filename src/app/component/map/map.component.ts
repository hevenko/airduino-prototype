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
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
//import VectorLayer from 'ol/layer/Vector';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
//import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Region } from 'src/app/model/region';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GeoJSONFeature } from 'src/app/model/geo-json-feature';
import { RawData } from 'src/app/model/raw-data';
import { FilterModel } from 'src/app/model/filter-model';
import { easeIn, easeOut, inAndOut, linear, upAndDown } from 'ol/easing';
import { GeoJSONGeometry } from 'src/app/model/geo-json-geometry';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  static RADIUS_FACTOR: number = 0.68681318;
  projection = "EPSG:3857";
  subscription;
  map: Map;
  tileLayer: TileLayer;
  vectorLayer: VectorLayer;
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

  modify = new Modify({ source: this.sourceFeatures });
  snap = new Snap({ source: this.sourceFeatures });

  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel) { }

  ngOnDestroy(): void {
    this.clearMap();
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

  initMap(ctx) {
    return new Promise((resolve) => {
        setTimeout(() => { // without setTimeout map is empty
          const customCondition = function (mapBrowserEvent) {
            //console.log(mapBrowserEvent);
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
    //console.log("polygon deactivated");
    this.drawCircle.setActive(false);
    //console.log("circle deactivated");
    if (locations && locations.polygon) {
      //console.log("polygon activated");
      this.drawPolygon.setActive(true);
    }
    if (locations && locations.circle) {
      //console.log("circle activated");
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
    this.map.addInteraction(this.modify);
    this.map.addInteraction(this.drawPolygon);
    this.map.addInteraction(this.drawCircle);
    this.drawPolygon.on('drawstart', this.drawStart);
    this.drawPolygon.on('drawend', this.drawEnd);
    this.drawCircle.on('drawstart', this.drawStart);
    this.drawCircle.on('drawend', this.drawEnd);
    this.modify.setActive(false);
    //console.log("modify deactivated");
    this.drawPolygon.setActive(false);
    //console.log("polygon deactivated");
    this.drawCircle.setActive(false);
    //console.log("circle deactivated");
    this.filterModel.locationsSubject.subscribe(value => {
      console.log("filterModel changed to:", value);
      const locations = this.filterModel.locations;
      //console.log("location:", locations);
      this.createFeaturesFromLocation();
      
      this.changeInteraction(locations);
      this.modify.setActive(locations.polygon || locations.circle);
      //console.log("modify activated:", !!(locations.polygon || locations.circle));
    });
    this.dataStorageService.drawDataBus.subscribe((region: any) => {
      console.log("named location:", region);
      if (!region || (this.filterModel.locations && (this.filterModel.locations.polygon || this.filterModel.locations.circle))) {
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
      this.clearMap();
      this.vectorFeatures.getSource().addFeature(feature);
      console.log("feature added");
      this.map.getView().fit(feature.getGeometry(), { padding: [100, 100, 100, 100], duration: 2000, easing: inAndOut });
    });
    /*
    this.vector.getSource().on('addfeature', function(event){
      console.log('addfeature:', event);
    });
     */
    this.vectorFeatures.getSource().on('changefeature', (event) => {
      this.drawEnd(event);
    });
    this.map.addInteraction(this.snap);

    this.dataStorageService.loadingStatusBus.subscribe((isLoading: boolean) => {
      if(isLoading) {
        this.clearPoints();
      } else {
        console.log('points:'+this.sourcePoints.getFeatures().length)
      }
    });
    this.subscribeData();
    this.map.on('singleclick', (evt) => {
      var pixel = this.map.getPixelFromCoordinate(evt.coordinate);
      this.map.forEachFeatureAtPixel(pixel, function(feature) {
          console.log(feature); // id of selected feature
      });
    });
    this.highlightFeaturesSubscribe();
  }
  highlightFeaturesSubscribe(): Subscription {
    return this.dataStorageService.highlightFeaturesBus.subscribe((coords: GeoJSONGeometry[]) => {
      coords?.forEach((c: GeoJSONGeometry) => {
          if (c.type === 'Point') {
            if (c.coordinates.length) {
              let cordFix = fromLonLat(c.coordinates);
              let features:Feature[] = this.sourcePoints.getFeaturesAtCoordinate(cordFix);//this.map?.getFeaturesAtPixel(this.map?.getPixelFromCoordinate(cordFix));
              features.forEach((f, i) => {
                f.set('selected', true);
                // if (i === 0) {
                //   this.map.getView().fit(f.getGeometry(), { padding: [100, 100, 100, 100], duration: 2000, easing: inAndOut });
                // }
              });  
            } else { // if no coords are given setting selected to false to all Point features
              let features:Feature[] = this.sourcePoints.getFeatures();
              features.forEach(f => {
                f.set('selected', false);;
              });
            }
          } else {
            console.error('highlightFeaturesSubscribe() : only Point is supported');
          }
      });
    });
  }

  fetchData() {
    this.clearPoints();
    this.subscribeData();
    this.subscription = this.dataStorageService.fetchData(this.filterModel);
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
        if (this.sourcePoints.getFeatures().length != 0) {
          const features = data.map(p => new Feature({ geometry: new Point(fromLonLat(p.gps)) }));
          this.drawPoints(features);  
        }
    });
    // delete this and there are no point features when returning back
    this.dataStorageService.availableDataBus
    .subscribe((data: RawData[]) => {
      if (this.sourcePoints.getFeatures().length == 0) {
        const features = data.map(p => new Feature({ geometry: new Point(fromLonLat(p.gps)) }));
        this.drawPoints(features);
      }
  });
  }

  drawPoints(features: any[]) {
    features.forEach((feature: any, index: number) => {
        //feature.set('selected', index == 2); // TODO: replace this with selected row in rawData
        this.vectorPoints.getSource().addFeature(feature);
    });
  }
}
