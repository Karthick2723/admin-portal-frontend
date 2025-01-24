import { Injectable } from '@angular/core';
import { CustomEditorImgresizeComponent } from '../main/custom-editor-imgresize/custom-editor-imgresize.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CustomEditorImgpopupService {

  private dialogRef: any;

  constructor(public dialog: MatDialog, private router: Router) { 

  }

  private closeModal(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  openModal(title: string, message: string, data: any, isView:boolean,index:number , yes: Function = null, no: Function = null): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.data = {
        title: title,
        message: message,
        data: data,
        isView: isView,
        index:index
    };

    dialogConfig.position = {
      top: '10%', 
      left: '30%', 
      right: '20%', 
      bottom: '40%' 
    };

    dialogConfig.width = '50vw'; 
    dialogConfig.height = '50vw';
    dialogConfig.maxHeight = '70vh';
    dialogConfig.panelClass = 'event-dialog-container';
    this.dialogRef = this.dialog.open(CustomEditorImgresizeComponent, dialogConfig);
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
