import { Injectable } from '@angular/core';
import { EventRegistrationlistDialogComponent } from '../main/event-seminor/event-registrationlist-dialog/event-registrationlist-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventRegistrationServiceService {
  private dialogRef: any;

  constructor(public dialog: MatDialog, private router: Router) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url !== '/events') {
          this.closeModal();
        }
      }
    });
  }

  private closeModal(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  openModal(title: string, message: string, data: any, yes: Function = null, no: Function = null): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.data = {
        title: title,
        message: message,
        data: data
    };


    dialogConfig.position = {
      top: '15%', 
      left: '20%', 
      right: '20%', 
      bottom: '40%' 
    };

    dialogConfig.width = '75vw'; 
    dialogConfig.maxHeight = '70vh'; 
    dialogConfig.panelClass = 'event-dialog-container';
    this.dialogRef = this.dialog.open(EventRegistrationlistDialogComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (yes) {
          yes();
        }
      } else {
        if (no) {
          no();
        }
      }
      this.dialogRef = null; 
    });
  }
}
