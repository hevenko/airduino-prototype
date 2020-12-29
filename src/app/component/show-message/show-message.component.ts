import { Component, OnInit } from '@angular/core';
import { MessageService, iMessage, MessageColor } from 'src/app/shared/service/message.service';

@Component({
  selector: 'app-show-message',
  templateUrl: './show-message.component.html',
  styleUrls: ['./show-message.component.css']
})
export class ShowMessageComponent implements OnInit {
  errorMessages: iMessage[] = [];
  constructor(private messageService: MessageService) { }
  setTimeOutId;

  ngOnInit() {
    this.messageService.messageBus.subscribe((value: iMessage[]) => {
      if (!!value && value.length > 0) {
        this.errorMessages = this.errorMessages.concat(value);
        if(!!this.setTimeOutId) {
          clearTimeout(this.setTimeOutId)
        }
        this.setTimeOutId = setTimeout(() => {
          this.autoClose();
        }, 3000);
      }
    });
  }
  close(ind: number) {
    this.errorMessages.splice(ind, 1);
  }
  messageColourClass(msg: iMessage): string {
    let result = '';
    if (msg.messageColor === MessageColor.Green) {
        result = 'alert-success';
    } else
    if (msg.messageColor === MessageColor.Yellow) {
        result = 'alert-warning';
    } else
    if (msg.messageColor === MessageColor.Red) {
      result = 'alert-danger';
    }
    return result;
  }
  autoClose() {
    let messages: iMessage[] = [];
    this.errorMessages?.forEach((v:iMessage, i: number) => {
      if (v.messageColor === MessageColor.Red) {
        messages.push(v);
      }
    });
    this.errorMessages = messages;
  }
}
