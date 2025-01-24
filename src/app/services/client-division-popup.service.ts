import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddClientBranchComponent } from '../main/clients/add-client-branch/add-client-branch.component';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClientDivisionPopupService {
  private dialogRef: any;

  constructor(public dialog: MatDialog, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (!event.url.startsWith('/add-clients')) {
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

  openModal(title: string, action: string, clientId: number, clientDivisionId: number, clientDivisionData: any, yes: Function = null, no: Function = null) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: title,
      action: action,
      clientId: clientId,
      clientDivisionId: clientDivisionId,
      clientDivisionData: clientDivisionData
    };

    dialogConfig.position = {
      top: '10%', 
      left: '20%', 
      right: '20%',
      bottom: '10%'
    };

    dialogConfig.width = '70vw'; 
    dialogConfig.maxHeight = '70vh';
    dialogConfig.panelClass = 'event-dialog-container';
    this.dialogRef = this.dialog.open(AddClientBranchComponent, dialogConfig);
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
