import { DataSetPoint } from "./data-set-point";

export class DataSet {
    static colorCounter = 0;
    label: string;
    name: string;
    fill: boolean = false;
    data: DataSetPoint[] = [];
    color: string;
    borderColor: string;
    borderWidth = 0;
    pointRadius = 1;
    constructor(label: string, color: string)  {
        this.label = label;
        this.name = label;
        this.color = color;
        this.borderColor = color;
    }
}