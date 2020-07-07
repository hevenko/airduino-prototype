import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {
  selectedOption: string;

  constructor() { }

  ngOnInit(): void {
  }

  getLabel(): string {
    return '4 locations';
  }
}
