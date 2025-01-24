import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';

@Component({
  selector: 'app-event-registrationlist-dialog',
  templateUrl: './event-registrationlist-dialog.component.html',
  styleUrls: ['./event-registrationlist-dialog.component.scss']
})
export class EventRegistrationlistDialogComponent {
  modalTitle: string;
  modalMessage: string;
  modalType: ModalType = ModalType.INFO;
  headers: any[] = ['S.No', 'Name', 'Email ID', 'Phone Number', 'Company Name', 'Designation', 'Department', 'Date and time', 'Register Date'];
  participantsList: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.modalTitle = data.title;
    this.modalMessage = data.message;
    this.modalType = data.type;
    this.participantsList = data.data
  }
  participantFullName(firstName: string, lastName: string): string {
    return firstName + " " + lastName;
  }
  participantDateTime(date: any, from: any, to: any): string {
    if (date && from && to) {
      return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY") + " " +
        moment(from, "HH:mm:ss").format("hh:mm") + " to " + moment(to, "HH:mm:ss").format("hh:mm");
    }
    return '';
  }
  convertMinFormat(minutes: any): any {
    return moment(minutes, "HH:mm:ss").format("hh:mm");
  }
}
export enum ModalType {
  INFO = 'info',
  WARN = 'warn'
}