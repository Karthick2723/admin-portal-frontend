import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalType } from '../event-seminor/event-registrationlist-dialog/event-registrationlist-dialog.component';
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomEditorImgResponsive, CustomEditorSections } from 'src/assets/constants/enums/custom-editor-enums';
import { CustomEditorImgpopupService } from 'src/app/services/custom-editor-imgpopup.service';
import { ToastrService } from 'ngx-toastr';
import { sizeFormatValidator } from 'src/assets/constants/custom-fields-validation-contant';

@Component({
  selector: 'app-custom-editor-imgresize',
  templateUrl: './custom-editor-imgresize.component.html',
  styleUrls: ['./custom-editor-imgresize.component.scss']
})
export class CustomEditorImgresizeComponent implements OnInit, OnDestroy, AfterViewInit {

  modalTitle: string;
  modalMessage: string;
  modalType: ModalType = ModalType.INFO;
  receivedformData: any;
  editorFields: FormGroup = this.fb.group({
    customEditorId: 0, 
    imgFitPosition: [{ value: '', disabled: false }], 
    imgCustomSize: ['', [sizeFormatValidator()]], 
    imgBorder: 0, 
    image: '', 
    index: 0,
    templateSection: 0,
    imagePadding: 0
  });
  customEditorImgResponsive = CustomEditorImgResponsive;
  customEditorSections = CustomEditorSections;
  responsiveOptions: { key: number, value: string }[];
  isView: boolean = false;
  index: number;
  modifiedEditorImgData: any;
  recivedData: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public commonService: CommonService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CustomEditorImgpopupService, any>,
    private notify: ToastrService,
  ) {
    this.modalTitle = data?.title;
    this.modalMessage = data?.message;
    this.modalType = data?.type;
    this.receivedformData = data?.data;
    this.isView = data?.isView;
    this.index = data?.index;
    this.recivedData = data;
    this.responsiveOptions = Object.keys(this.customEditorImgResponsive)
      .filter(key => isNaN(Number(key))) 
      .map(key => ({ key: parseInt(this.customEditorImgResponsive[key]), value: key }));

  }

  isInValidField(formControlName: string): boolean {
    return this.editorFields.get(formControlName).invalid && (this.editorFields.get(formControlName).dirty ||
      this.editorFields.get(formControlName).touched);
  }

  saveImgDataToForm() {

    if (parseInt(this.editorFields.get('imgFitPosition').value) != this.customEditorImgResponsive?.CutomSize) {
      this.editorFields.get('imgCustomSize').setValue('');
    }

    if (this.editorFields.invalid) {
      this.notify.error('Invalid format. Please use  200*200 Format.');
      return;
    }

    this.commonService.setImgDataForEditor(this.editorFields.getRawValue());
    this.closeImgCustomizePopup();
  }

  convertToBase64(formControlName: string, event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (allowedTypes.includes(file.type)) {
        if (file.size <= maxSizeBytes) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result as string;
            if (this.formField(formControlName)) {
              this.formField(formControlName).setValue(base64Data);
            }
          };

          reader.readAsDataURL(file);
        } else {
          this.notify.error('The file size should be 5 MB or less.');
        }
      } else {
        this.notify.error('Only JPG,GIF and PNG images are allowed.');
      }
    }
  }


  getCustomEditorImg(formControlName: string) {
    var img = this.formField(formControlName)
    return img.value == '' || img.value == null ? null : img.value;
  }
  formField(formControlName: string) {
    return this.editorFields.get(formControlName)
  }
  removeImg() {
    this.editorFields.get('image').setValue('');
  }
  ngOnInit(): void {
    this.editorFields.patchValue({
      customEditorId: this.receivedformData?.customEditorId, 
      imgFitPosition: parseInt(this.receivedformData?.imgFitPosition) == null || 0 ? '' : parseInt(this.receivedformData?.imgFitPosition), // Fit or thumbnail options
      imgCustomSize: this.receivedformData?.imgCustomSize == '' ? '' : this.receivedformData?.imgCustomSize,
      imgBorder: this.receivedformData?.imgBorder, 
      image: this.checkImageFields(this.receivedformData),
      index: this.index,
      templateSection: this.receivedformData?.templateSection,
      imagePadding: this.receivedformData?.imagePadding
    });
    if (this.isView) {
      this.editorFields.get('imgFitPosition').disable();
    } else {
      this.editorFields.get('imgFitPosition').enable();
    }

    this.commonService.editorImgData.subscribe((response) => {
      this.modifiedEditorImgData = response;
    });
  }

  closeImgCustomizePopup() {
    this.dialogRef.close(true);
  }
  ngOnDestroy(): void {
  }
  ngAfterViewInit(): void {
  }

  checkImageFields(obj: any): string | null {
    const keysToCheck = ['rightSideImage', 'leftSideImage', 'bottomImage'];

    for (const key of keysToCheck) {
      const value = obj[key];
      if (value && value !== 'null') {
        return value;
      }
    }
    return null;
  }
}

