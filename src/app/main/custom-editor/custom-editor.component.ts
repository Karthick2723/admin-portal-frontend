import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { CustomEditorImgpopupService } from 'src/app/services/custom-editor-imgpopup.service';
import { CustomEditorFieldPartitions, CustomEditorImgAlignment, CustomEditorImgFieldPartitions, CustomEditorImgResponsive, CustomEditorSections } from 'src/assets/constants/enums/custom-editor-enums';

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrls: ['./custom-editor.component.scss']
})
export class CustomEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('editor') editor: AngularEditorComponent;
  @ViewChildren(AngularEditorComponent) editors: QueryList<AngularEditorComponent>;
  @Input() initialData: FormArray;
  @Output() formDataChanged = new EventEmitter<any[]>();
  customEditorsForm: FormGroup;
  @Input() receiveData: any[] = [];
  @Input() isEditorDataLoad: boolean;
  @Input() isView: boolean;
  isPreview: boolean = false;
  isEditor: boolean = true;
  customEditorEnum = CustomEditorSections;
  customEditorFieldPartitions = CustomEditorFieldPartitions;
  customEditorImgAlignment = CustomEditorImgAlignment;
  customEditorImgResponsive = CustomEditorImgResponsive;
  tooltipContent = ['Right Align', 'Left Align', 'Center Align'];
  config: AngularEditorConfig;
  constructor(private fb: FormBuilder, private toastr: ToastrService, public sanitizer: DomSanitizer,
    private imgDialogService: CustomEditorImgpopupService, private commonService: CommonService,
    private cdr: ChangeDetectorRef, private renderer: Renderer2

  ) { }

  ngOnInit(): void {

    this.commonService.editorImgData.subscribe((response) => {
      if (response != null) {

        const customEditorsArray = this.customEditorsForm.get('customEditorsDTOs') as FormArray;
        const index = response?.index;
        const imgFitPosition = response?.imgFitPosition;
        const imgCustomSize = response?.imgCustomSize;
        const img = response?.image;
        const templateSection = response?.templateSection;
        const imgBorder = response?.imgBorder != null || undefined ? parseInt(response?.imgBorder) : 0;
        const imgPadding = response?.imagePadding != null || undefined ? parseInt(response?.imagePadding) : 0;
        if (templateSection == CustomEditorSections?.LeftSideImg) {
          customEditorsArray.controls.at(index)?.get('leftSideImage')?.setValue(img);
        }
        if (templateSection == CustomEditorSections?.RightSideImg) {
          customEditorsArray.controls.at(index)?.get('rightSideImage')?.setValue(img);
        }
        if (templateSection == CustomEditorSections?.Image) {
          customEditorsArray.controls.at(index)?.get('bottomImage')?.setValue(img);
        }
        if (index != null && index >= 0 && index < customEditorsArray.length) {
          customEditorsArray.at(index).patchValue({
            imgFitPosition: (imgFitPosition != null && parseInt(imgFitPosition) !== 0) ? parseInt(imgFitPosition) : 0,
            imgCustomSize: (parseInt(imgFitPosition) === CustomEditorImgResponsive?.CutomSize) ? imgCustomSize : '',
            imgBorder: imgBorder,
            imagePadding: imgPadding
          });
          this.emitFormData();
        }
      }
    });
    this.emitFormData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateDropdown();
    }, 0); 
  }
  updateDropdown() {
    const dropdownElements = document.getElementsByClassName('select-custom-style');
    if (dropdownElements.length > 0) {
      const dropdownElement = dropdownElements[0] as HTMLElement;
      const pickerLabel = dropdownElement.querySelector('.ae-picker-label');
      if (pickerLabel) {
        const svg = pickerLabel.querySelector('svg');
        const newTextContent = 'Font Size';
        pickerLabel.innerHTML = ''; 
        pickerLabel.textContent = newTextContent;  
        if (svg) {
          pickerLabel.appendChild(svg);  
        }
      }
      const firstOption = dropdownElement.querySelector('.ae-picker-item');
      if (firstOption) {
        firstOption.textContent = 'Remove Size';  
      }
    }
    this.cdr.detectChanges();
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  ngOnChanges() {
    this.config = {
      editable: !this.isView,
      spellcheck: true,
      minHeight: '20rem',
      maxHeight: '20rem',
      placeholder: 'Enter text here...',
      translate: 'no',
      sanitize: false,
      toolbarPosition: 'top',
      defaultFontName: 'Work Sans', 
      defaultFontSize: '4px',
      fonts: [
        { class: 'arial', name: 'Arial' },
        { class: 'times-new-roman', name: 'Times New Roman' },
        { class: 'calibri', name: 'Calibri' },
        { class: 'comic-sans-ms', name: 'Comic Sans MS' },
        { class: 'work-sans', name: 'Work Sans' }
      ],
      customClasses: [
        { name: '12px', class: 'font-size-12px', tag: 'span' },
        { name: '14px', class: 'font-size-14px', tag: 'span' },
        { name: '16px', class: 'font-size-16px', tag: 'span' }, 
        { name: '18px', class: 'font-size-18px', tag: 'span' },
        { name: '20px', class: 'font-size-20px', tag: 'span' },
        { name: '25px', class: 'font-size-25px', tag: 'span' },
        { name: '30px', class: 'font-size-30px', tag: 'span' },
        { name: '32px', class: 'font-size-32px', tag: 'span' }
      ],
      toolbarHiddenButtons: [
        ['insertImage', 'insertVideo', 'fontSize']
      ],
    };
    setTimeout(() => {
      this.updateDropdown();
    }, 0); 

    this.customEditorsForm = this.fb.group({
      customEditorsDTOs: this.fb.array(this.initialData.length > 0 ? this.mapDataToGroups(this.initialData) : [this.createCustomEditor()])
    });

    if (this.isView && !this.isEditorDataLoad) {
      this.changePreview();
    }
  }

  logFormArrayValues(formArray: FormArray): void {
    const values = formArray.controls.map(control => control.value);
  }

  openImgEditorPopup(data: any, index: number) {
    this.imgDialogService.openModal("Custom Editor", "Img Popup", data, this.isView, index, () => {
    }, () => {
    });
  }
  showImgEditorPopup(index: number, formControlName: string) {
    this.openImgEditorPopup((this.customEditorsForm.get('customEditorsDTOs') as FormArray)?.at(index)?.value, index);
  }
  get customEditorsDTOs(): FormArray {
    return this.customEditorsForm.get('customEditorsDTOs') as FormArray;
  }

  private mapDataToGroups(data: FormArray): FormGroup[] {
    return data.controls.map(control => this.createCustomEditor(control.value));
  }

  private createCustomEditor(data: any = {}): FormGroup {
    return this.fb.group({
      customEditorId: [data.customEditorId || ''],
      content: [data.content || ''],
      previewPage: [data.previewPage || ''],
      bottomImage: [data.bottomImage || ''],
      rightSideImage: [data.rightSideImage || ''],
      leftSideImage: [data.leftSideImage || ''],
      templateSection: [data.templateSection || CustomEditorSections.TextArea],
      inputFieldPartitionRatio: [data.inputFieldPartitionRatio || CustomEditorFieldPartitions.HalfOfQuater],
      imageFieldPartitionRatio: [data.imageFieldPartitionRatio || CustomEditorImgFieldPartitions.SingleImg],
      imgAlignment: [data.imgAlignment || CustomEditorImgAlignment.Center],
      imgFitPosition: [data.imgFitPosition || 0],
      imgCustomSize: [data.imgCustomSize || 0],
      imgBorder: [data.imgBorder || 0],
      imagePadding: [data.imagePadding || 0]
    });
  }

  addCustomEditor(): void {
    this.customEditorsDTOs.push(this.createCustomEditor());
    this.emitFormData();
  }

  removeCustomEditor(index: number): void {
    if (this.customEditorsDTOs.length > 1) {
      this.customEditorsDTOs.removeAt(index);
      this.emitFormData();
    }
  }

  emitFormData(): void {
    this.formDataChanged.emit(this.customEditorsDTOs.value);
  }


  customEditorsArrField(index: number, formControlName: string) {
    return (this.customEditorsForm.get('customEditorsDTOs') as FormArray).controls.at(index).get(formControlName)
  }

  setEditorInputFieldStyle(index: number, formControlName: string, value: number) {
    if (!this.isView) {
      this.customEditorsArrField(index, formControlName).setValue(value);
    }
  }

  addCustomEditors(sectionEnum: number): void {

    this.customEditorsDTOs.push(
      this.fb.group({
        customEditorId: [],
        content: [''], 
        previewPage: [''],
        bottomImage: [''],
        rightSideImage: [''],
        leftSideImage: [''],
        templateSection: [sectionEnum],
        inputFieldPartitionRatio: [CustomEditorFieldPartitions?.HalfOfQuater],
        imageFieldPartitionRatio: [CustomEditorImgFieldPartitions?.SingleImg],
        imgAlignment: [this.customEditorImgAlignment?.Left], 
        imgFitPosition: [0], 
        imgCustomSize: [''],
        imgBorder: [0],
        imagePadding: [0]
      })
    );

    this.emitFormData();
  }

  imgCustomWidth(sizeString: string) {
    if (sizeString == "0" || sizeString == null) {
      return 'auto';
    }
    const [width, height] = sizeString.split(/[×*]/).map(Number);
    return width;

  }

  imgCustomHeight(sizeString: string) {
    if (sizeString == "0" || sizeString == null) {
      return 'auto';
    }
    const [width, height] = sizeString.split(/[×*]/).map(Number);
    return height;
  }
  getCustomEditorImg(index: number, formControlName: string) {
    var img = this.customEditorsArrField(index, formControlName)
    return img.value ? img.value : null;
  }

  changePreview() {
    if (!this.checkCustomEditors()) {
      this.isPreview = true;
      this.isEditor = false;
      this.emitFormData();
      setTimeout(() => {
        this.updateDropdown();
      }, 0); 
    }

  }

  chageEditor() {
    this.isEditor = true;
    this.isPreview = false;
    setTimeout(() => {
      this.updateDropdown();
    }, 0);
  }
  checkCustomEditors() {
    const customEditorsArray = this.customEditorsForm.get('customEditorsDTOs') as FormArray;
    let isEmptyFieldFound = false;
    customEditorsArray.controls.forEach((group: FormGroup) => {
      const content = group.get('content')?.value;
      const bottomImage = group.get('bottomImage')?.value;
      const rightSideImage = group.get('rightSideImage')?.value;
      const leftSideImage = group.get('leftSideImage')?.value;
      if (!content && !bottomImage && !rightSideImage && !leftSideImage) {
        isEmptyFieldFound = true;
      }
    });

    if (isEmptyFieldFound) {
      this.toastr.error('Solutions full description fields are empty.');
    }
    return isEmptyFieldFound;
  }


  setinputFieldPartitionRatio(index: number, fieldRatio: number) {
    this.customEditorsArrField(index, 'inputFieldPartitionRatio').setValue(fieldRatio);
  }
  setimageFieldPartitionRatio(index: number, imageRatio: number) {
    this.customEditorsArrField(index, 'imageFieldPartitionRation').setValue(imageRatio);
  }

}