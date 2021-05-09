import { Component, OnInit } from '@angular/core';
import { FilterModel } from 'src/app/model/filter-model';
import { Constants } from 'src/app/shared/constants';
import { DataStorageService } from 'src/app/shared/service/data-storage.service';
import { MessageService } from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-get-data',
  templateUrl: './get-data.component.html',
  styleUrls: ['./get-data.component.css']
})
export class GetDataComponent implements OnInit {
  subscription;
  constructor(private dataStorageService: DataStorageService, private filterModel: FilterModel, private messageService: MessageService) { }

  ngOnInit(): void {
    this.dataStorageService.usubscribeBroadcastBus.subscribe(v => {
      this.subscription?.unsubscribe();
    });
  }
  getData() {
    if(this.filterModel.isFilterSet()) {
      this.subscription = this.dataStorageService.fetchData(this.filterModel);
    } else {
      this.messageService.showWarningMessage(Constants.MSG_MISSING_DATA_FILTER);
    }
  }

}
