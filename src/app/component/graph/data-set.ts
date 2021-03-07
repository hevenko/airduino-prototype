import { DataSetPoint } from "./data-set-point";

export class DataSet {
    label: string;
    fill: boolean = false;
    data: DataSetPoint[] = [];

    constructor(label: string) {
        this.label = label;
    }
}