export interface Device {
  id: number;
  type: string;
  owner: number;
  firmvare: number;
  ffirmvare: number;
  configuration: string;
  fconfiguration: string;
  apikey: string;
  note: string;
  enabled: boolean;
}