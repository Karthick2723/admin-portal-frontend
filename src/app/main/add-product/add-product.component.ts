import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CategoryService } from 'src/app/services/category.service';
import { CompressImageService } from 'src/app/services/compress-image.service';
import { HttpService } from 'src/app/services/http-services';
import { ProductService } from 'src/app/services/product.service';
import { AngularEditorComponent } from '@kolkov/angular-editor';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CommonService } from 'src/app/services/common.service';
import { CustomEditorImgpopupService } from 'src/app/services/custom-editor-imgpopup.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { CustomEditorImgResponsive, CustomEditorSections } from 'src/assets/constants/enums/custom-editor-enums';


@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('previewContent', { static: false }) myDivElement: ElementRef;
  @ViewChild('cropperModal') cropperModal: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('editor') editor: AngularEditorComponent;

  tooltipContent = ['Right Align', 'Left Align', 'Center Align'];
  message: string = 'lwqkejd;ew';
  imageUrl: any;
  close: boolean = true;
  id: any;
  action: any;
  serviceOrTechnologyId: any;
  VendorNames: any;
  categories: any;
  base64String: string | ArrayBuffer | null = null;
  tags = [];
  selectedTags: number[];
  selectedVendors: { vendorId: number; vendorName: string }[] = [];
  submitLoader: boolean = false;
  selected: boolean = true;
  isCropped: boolean = false;
  modalReference: NgbModalRef;
  modalRef: NgbModalRef;
  croppedImage: string = '';
  imageChangedEvent: any = ''
  coverImg: string = '';
  publishbtn: boolean = false;
  productImage: any;
  imagePath: any;
  imgURL: string | ArrayBuffer;
  isView: boolean = false;
  private subscriptions: Subscription[] = [];
  isPreview: boolean = false;
  isEditor: boolean = true;
  sanitizedHtml: SafeHtml;
  addProduct: FormGroup;
  productShortDescMaxLength = 250;
  customEditor: FormArray;
  isEditorDataLoad: boolean = false;
  receivedData: any[] = [];
  originalProductName ='';
  constructor(private fb: FormBuilder, private webSocketService: WebSocketService,
    private activatedRoute: ActivatedRoute,
    private catservice: CategoryService,
    private http: HttpService,
    private toastr: ToastrService,
    private productservice: ProductService, private compressImage: CompressImageService,
    private router: Router,
    public sanitizer: DomSanitizer,
    private imgDialogService: CustomEditorImgpopupService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.addProduct = this.fb.group({
      productId: [0],
      productName: ['', [Validators.required, Validators.maxLength(100)]],
      productShortDesc: ['', [Validators.required, Validators.maxLength(250)]],
      productImage: ['', Validators.required],
      productImageView: [''],
      productDesc: [''],
      productCode: ['', [Validators.required]],
      categoryId: [0, [Validators.required]],
      productType: ['', [Validators.required]],
      vendorId: ['', [Validators.required]],
      status: ["Active"],
      isPublished: [false],
      productTags: [[], Validators.required],
      domFullContent: [],
      customEditorsDTOs: this.fb.array([]),
    });
  }

  get customEditorsDTOs(): FormArray {
    return this.addProduct.get('customEditorsDTOs') as FormArray;
  }

  handleFormDataChanged(updatedData: any[]): void {
    const customEditorsDTOs = this.addProduct.get('customEditorsDTOs') as FormArray;
    customEditorsDTOs.clear();
    updatedData.forEach(data => {
      const editorGroup = this.fb.group({
        customEditorId: [data.customEditorId],
        content: [data.content],
        previewPage: [data.previewPage],
        bottomImage: [data.bottomImage],
        rightSideImage: [data.rightSideImage],
        leftSideImage: [data.leftSideImage],
        templateSection: [data.templateSection],
        inputFieldPartitionRatio: [data.inputFieldPartitionRatio],
        imageFieldPartitionRatio: [data.imageFieldPartitionRatio],
        imgAlignment: [data.imgAlignment],
        imgFitPosition: [data.imgFitPosition],
        imgCustomSize: [data.imgCustomSize],
        imgBorder: [data.imgBorder],
        imagePadding: [data.imagePadding]
      });
      customEditorsDTOs.push(editorGroup);
    });
  }

  ngAfterViewInit(): void {
    this.updateDropdown();
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
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.getallVendorList();
    this.getAllProductTags();
    const queryParams = this.activatedRoute.queryParamMap.subscribe(res => {
      this.id = res.get('id');
      this.action = res.get('action');
      this.serviceOrTechnologyId = parseInt(res?.get('ServiceOrTechnologyId'));
      if (this.action == 'edit') {
        this.patchDataInView();
        this.addProduct.enable();
        this.isView = false;
      }
      if (this.action == 'view') {
        this.patchDataInView();
        this.disableForm();
        this.isView = true;
      }
      this.addProduct.get('categoryId').setValue(parseInt(this.serviceOrTechnologyId));
    });
    this.subscriptions.push(queryParams);
    const imgData = this.commonService.editorImgData.subscribe((response) => {
      if (response != null) {
        const customEditorsArray = this.addProduct.get('customEditorsDTOs') as FormArray;
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
        }
      }
    });
    this.subscriptions.push(imgData);
  }

  get getCoverImg() {
    var img = this.addProduct.get('productImage');
    return img.value ? img.value : null;
  }

  getallVendorList() {
    const getallcategory = this.catservice.getallcategory().subscribe(
      (response: any) => {
        this.categories = response
        this.onCategorySelected(this.serviceOrTechnologyId);
      });
    this.subscriptions.push(getallcategory);
  }
  onBlur() {
    const productName = this.addProduct.get('productName').value;
    let existingProductTags = this.addProduct.get('productTags').value || [];
        const productNameExists = existingProductTags.some(tag => tag.productTagName === this.originalProductName);
    if (!productNameExists) {
      if (existingProductTags.length > 0) {
        existingProductTags = [{
          ...existingProductTags[0], 
          productTagName: productName, 
          disabled: true, 
        }];
      } else {
        existingProductTags.push({
          productTagId: 0, 
          productTagName: productName,
          disabled: true,
        });
      }
    } else {
      existingProductTags.forEach(tag=>{
        if(tag.productTagName==this.originalProductName){
            tag.productTagName = productName;
            this.originalProductName=tag.productTagName;
        }
      })
    }
  
    this.addProduct.get('productTags').setValue(existingProductTags);
  }
  
  
  addCustomTag(term: any) {
    return {
      productTagId: 0, productTagName: term
    }
  }

  getAllProductTags() {
    const getAllTags = this.productservice.getAllProductTags().subscribe(res => {
      this.tags = res;
    });

    this.subscriptions.push(getAllTags);
  }

  goBack() {
    window.history.back();
  }

  togglePublished(event: any) {
    const checked = event.target.checked;
    this.addProduct.get('isPublished').setValue(checked);

  }

  convertToBase(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.close = false;
    reader.onload = () => {
      this.base64String = reader.result;
      this.addProduct.get('productImage').setValue(this.base64String);
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.addProduct.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.addProduct.controls).forEach(key => {
      const control = this.addProduct.get(key);
      const value = control.value;
      const isRequired = control.hasValidator(Validators.required);
      if (isRequired) {
        if (value === ' ' && value.trim().length === 0) {
          hasWhitespaceError = true;
        }
        if (value === null || value === '') {
          emptyRequiredField = true;
        }
      }
    });
    if (hasWhitespaceError) {
      this.toastr.error("Spaces are not allowed in the fields.");
      this.submitLoader = false
      return;
    }
    if (emptyRequiredField || this.addProduct.invalid) {
      this.toastr.error("Please enter the mandatory fields.");
      this.submitLoader = false
      return;
    }
    const source = document.getElementById("previewContent");
    if (source?.innerHTML === undefined || !source?.innerHTML) {
      this.toastr.warning("Confirm Full Description");
      return;
    }
    this.addProduct.get('domFullContent').setValue(source?.innerHTML);
    const formValue = this.addProduct.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false'; 
    this.submitLoader = true;
    const addProduct = this.productservice.addProduct(formValue).subscribe(
      (response: any) => {
        this.submitLoader = false;
        if (response.statusCode === 200) {
          this.webSocketService.sendProduct("LOAD_SOLUTION");
          this.toastr.success(response.responseMessage);
          this.addProduct.reset();
          this.router.navigate(['/add-category'], { queryParams: { id: response.categoryId, action: 'edits' } });
          this.goBack();
          return;
        }
        this.toastr.error(response.responseMessage);
      },
      (error) => {
        this.submitLoader = false;
        this.toastr.error("An error occurred. Please try again.");
      }
    );
    this.subscriptions.push(addProduct);
  }

  update() {
    this.addProduct.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    let emptyKeywords = false;
    Object.keys(this.addProduct.controls).forEach(key => {
      const control = this.addProduct.get(key);
      const value = control.value;
      const isRequired = control.hasValidator(Validators.required);
      if (isRequired) {
        if (value === ' ' && value.trim().length === 0) {
          hasWhitespaceError = true;
        }
        if (value === null || value === '') {
          emptyRequiredField = true;
        }
      }
      if (key === 'productTags' && (value === null || value.length === 0 || value === '[]')) {
        emptyKeywords = true;
      }
    });
    if (hasWhitespaceError) {
      this.toastr.error("Spaces are not allowed in the fields.");
      this.submitLoader = false;
      return;
    }
    if (emptyRequiredField) {
      this.toastr.error("Please enter the mandatory fields.");
      this.submitLoader = false;
      return;
    }
    if (emptyKeywords) {
      this.toastr.error("Please enter the keywords");
      this.submitLoader = false;
      return;
    }
    this.addProduct.value.productImage = this.base64String;
    const source = document.getElementById("previewContent");
    if (source?.innerHTML == undefined || !source?.innerHTML) {
      this.toastr.warning("Confirm Full Description");
      return;
    }
    this.addProduct.get('domFullContent').setValue(source?.innerHTML);
    this.submitLoader = true;
    const formValue = this.addProduct.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false'; 
    const updateAll = this.productservice.updateall(this.addProduct.value, this.id).subscribe(
      (response: any) => {
        this.submitLoader = false;
        if (response.statusCode == 200) {
          this.webSocketService.sendProduct("LOAD_SOLUTION");
          this.webSocketService.sendProductPublish("UPDATE_PUBLISHED"); 
          this.toastr.success(response.responseMessage);
          this.addProduct.reset();
          this.router.navigate(['/add-category'], { queryParams: { id: response.categoryId, action: 'edits' } });
          this.goBack();
          return;
        }

        this.toastr.error(response.responseMessage);
      }, (error) => {
        this.submitLoader = false;
        this.toastr.error('The request has no response data available');
      });

    this.subscriptions.push(updateAll);
  }
  finalPublish() {
    if (this.action !== 'view' && this.action !== 'edit') {
    }
  }
  patchDataInView() {
    this.isEditorDataLoad = true;
    const getCategory = this.productservice.getCategoryById(this.id).subscribe((res) => {
      this.close = false;
      let data = {
        productName: res.productName,
        productShortDesc: res.productShortDesc,
        productDesc: res.productDesc,
        productCode: res.productCode,
        categoryId: res.category.categoryId,
        isPublished: res.isPublished,
        productType: res.productType == 'product' ? res.productType = 'product' : 'service',
        vendorId: res.vendor.vendorId,
        productTags: res.productTags,
        domFullContent: res?.domFullContent

      } 
      this.originalProductName = data.productName;
      this.addProduct.patchValue(data);
      this.VendorNames = [res.vendor]
      const customEditorsDTOsArray = this.customEditorsDTOs;
      if (res.customEditorsDTOs) {
        this.receivedData = [];
        this.receivedData = res.customEditorsDTOs;
        this.handleFormDataChanged(res.customEditorsDTOs);
      }
      this.isEditorDataLoad = false;
      this.coverImg = res?.productImage || '';
      this.addProduct.get('productImage').setValue(res?.productImage);

    })
    this.close = false;
    this.subscriptions.push(getCategory);
  }

  disableForm(): void {
    Object.keys(this.addProduct.controls).forEach(key => {
      const control = this.addProduct.get(key);
      control.disable();
    });
  }


  onCategorySelected(categoryId: number) {
    const selectedCategory = this.categories.find(category => category.categoryId == categoryId);
    if (selectedCategory) {
      const selectedVendors = selectedCategory.vendors;
      this.VendorNames = selectedVendors.flatMap(vendor => vendor);
    }
  }

  changeViewtoEdit() {
    this.addProduct.enable();
    this.action = 'edit';
    this.isView = false;
  }

  getClientFile(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.close = false;
      this.productImage = files.item(0);
      let bytes = this.productImage.size / 1024;
      let fileType = this.productImage.type;
      if (
        fileType == "image/jpg" ||
        fileType == "image/jpeg" ||
        fileType == "image/png" ||
        fileType == "image/gif" ||
        fileType == "image/apng" ||
        fileType == "image/avif" ||
        fileType == "image/svg+xml" ||
        fileType == "image/webp"
      ) {
        if (bytes < 5120) {
          if (files.length === 0) return;
          const imgCompress = this.compressImage
            .compress(this.productImage)
            .pipe(take(2))
            .subscribe(compressedImage => {
              this.productImage = compressedImage;
            });
          this.subscriptions.push(imgCompress);
          var reader = new FileReader();
          this.imagePath = files;
          reader.readAsDataURL(files[0]);
          reader.onload = (_event) => {
            this.imgURL = reader.result;
          };
        } else {
          this.toastr.error(
            'Image size should be lesser than 5 Mb'
          );
        }
      } else {
        this.toastr.error(
          'Unsupported media format'
        );
        return;
      }
    }
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (file && acceptedFileTypes.includes(file.type)) {
      this.imageChangedEvent = event;
      this.modalService.open(this.cropperModal);
    } else {
      this.toastr.error('Please select a PNG, JPG, or JPEG image.');
    }
  }

  confirmCrop(modal: any): void {
    this.coverImg = this.croppedImage;
    this.resetFileInput();
    modal.close();
  }

  resetFileInput(): void {
    const input = this.fileInput.nativeElement as HTMLInputElement;
    input.value = '';
    this.cdr.detectChanges();
  }

  onImageLoaded(): void {
    console.log('Image loaded');
  }

  onCropperReady(): void {
    console.log('Cropper ready');
  }

  onLoadImageFailed(): void {
    console.error('Load failed');
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.convertUrlToBase64(event.objectUrl).then(base64 => {
      this.croppedImage = base64; 
      this.addProduct.get('productImage').setValue(this.croppedImage); 
    });
  }

  async convertUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isInValidField(fieldName: string): boolean {
    const control = this.addProduct.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

}
