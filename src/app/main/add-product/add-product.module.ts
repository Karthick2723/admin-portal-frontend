import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProductRoutingModule } from './add-product-routing.module';
import { AddProductComponent } from './add-product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CustomEditorModule } from '../custom-editor/custom-editor.module';


@NgModule({
  declarations: [
    AddProductComponent,
  ],
  imports: [
    AngularEditorModule,
    CommonModule,
    FormsModule,
    AddProductRoutingModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgSelectModule,
    ImageCropperModule,
    MatTooltipModule,
    CustomEditorModule
  ],
  exports: [
    AddProductComponent
  ]
})
export class AddProductModule { }
