export interface Region {
  id: string;
  type: string;
  name: string;
  gtype: string;
  coordinates: [][][][] | [][][] | [][] | []; //multipolygon, polygon, line, dot
}