import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomEditorComponent } from './custom-editor.component';
import { RichTextClipboardDirective } from 'src/app/directives/rich-text-clipboard.directive';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [CustomEditorComponent, RichTextClipboardDirective
  ],
  imports: [
    AngularEditorModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    MatTooltipModule
  ],
  exports: [CustomEditorComponent]
})
export class CustomEditorModule { }
