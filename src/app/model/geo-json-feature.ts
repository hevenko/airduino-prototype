import { GeoJSONGeometry } from './geo-json-geometry';

export interface GeoJSONFeature {
  type: string;
  id: string;
  geometry: GeoJSONGeometry;
}