import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface IoDataResponse {
    dataState: IDataState;
    value: any[];
    equals(to: IDataState): boolean;
}

export class DataResponse implements IoDataResponse {
    dataState: IDataState;
    value: any[];
    
    constructor(dataState: IDataState, value: any[]){
        this.dataState = dataState;
        this.value = value;
    }
    equals(to: IDataState): boolean {
        return to.key === this.dataState.key 
                && to.parentID === this.dataState.parentID
                && to.parentKey === this.dataState.parentKey;
    } 
}
export interface IDataState {
    key: string;
    parentID: any;
    parentKey: string;
    rootLevel: boolean;
}

@Injectable()
export class RemoteLoDService {
    public url = `https://services.odata.org/V4/Northwind/Northwind.svc/`;

    constructor(private http: HttpClient) { }

    public getData(dataState?: IDataState): Observable<DataResponse> {
        return this.http.get(this.buildUrl(dataState)).pipe(
            map((response: IoDataResponse) => {
                return new DataResponse(dataState,response.value);
            })
        );
    }

    public buildUrl(dataState: IDataState) {
        let qS = "";
        if (dataState) {
            qS += `${dataState.key}?`;

            if (!dataState.rootLevel) {
                if (typeof dataState.parentID === "string") {
                    qS += `$filter=${dataState.parentKey} eq '${dataState.parentID}'`;
                } else {
                    qS += `$filter=${dataState.parentKey} eq ${dataState.parentID}`;
                }
            }
        }
        return `${this.url}${qS}`;
    }
}
