import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-show-message',
  templateUrl: './show-message.component.html',
  styleUrls: ['./show-message.component.css']
})
export class ShowMessageComponent implements OnInit {
  errorMessages: string[] = [];
  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.messageService.messageBus.subscribe(value => {
      if (!!value && value.length > 0) {
        this.errorMessages = this.errorMessages.concat(value);
      }
    });
  }
  close(ind: number) {
    this.errorMessages.splice(ind, 1);
  }
}
