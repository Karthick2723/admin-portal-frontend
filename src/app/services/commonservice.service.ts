import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonserviceService {
  private editedValue: any;
  constructor() { }
  setEditedValue(value: any) {
    this.editedValue = value;    
  }

  getEditedValue() {
    return this.editedValue;
  }
}
