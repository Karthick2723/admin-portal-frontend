import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/nav/shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from 'src/app/services/category.service';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/services/product.service';
import { CompressImageService } from 'src/app/services/compress-image.service';
import { Subscription, take } from 'rxjs';
import { AddProductModule } from '../../add-product/add-product.module';
import ProductComponent from '../../Product/Product.component';
import { LineOfbussinessComponent } from '../../line-ofbussiness/line-ofbussiness.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent, ImageCropperModule } from 'ngx-image-cropper';
import { WebSocketService } from 'src/app/services/web-socket.service';
@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, SharedModule, MatSelectModule, RouterModule, LineOfbussinessComponent, AddProductModule, ProductComponent, ImageCropperModule],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit, OnDestroy {
  @ViewChild('cropperModal') cropperModal: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  imageUrl: string;
  showError: boolean = true;
  imgInputclose: boolean = true;
  isEditable: boolean = false;
  id: any;
  vendorArrays = [];
  action: any;
  vendorNames: any;
  addCategory: FormGroup;
  publishbtn: boolean = false;
  productImage: any;
  imagePath: any;
  imgURL: string | ArrayBuffer;
  base64String: string | ArrayBuffer | null = null;
  victorImage: boolean = true;
  isCropped: boolean = false;
  modalReference: NgbModalRef;
  modalRef: NgbModalRef;
  croppedImage: string = '';
  imageChangedEvent: any = ''
  coverImg: string = '';
  breadCrums: string = "Services / Technologies";
  breadCrumsAdd: string = "Add Services / Technologies";
  breadCrumsView: string = "View Services / Technologies";
  breadCrumsEdit: string = "Edit Services / Technologies";
  addPageTitle = "Add Service / Technology";
  viewPageTitle = "View Service / Technology";
  editPageTitle = "Edit Service / Technology";
  isView: boolean = false;
  submitLoader: boolean = false;
  invalidFieldErrMsg: string = "Please enter valid data in the required fields.";
  inputTextMaxLength = 100;
  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder,
    private activatedRoute: ActivatedRoute, private categroyservice: CategoryService, private router: Router,
    private toastr: ToastrService, private productService: ProductService,
    private compressImage: CompressImageService,
    private modalService: NgbModal, private cdr: ChangeDetectorRef, private webSocketService: WebSocketService
  ) {

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.InitFormBuilder();
    this.getallVendorList();
    this.activatedRoute.queryParamMap.subscribe(res => {
      this.id = res.get('id');
      this.action = res.get('action');
      if (this.action == 'views') {
        this.imgInputclose = false;
        this.disableForm();
        this.getFullCategoryById(parseInt(this.id));
        this.isView = true;

        this.addCategory.disable();
      }
      if (this.action == 'edits') {
        this.isEditable = true;
        this.getFullCategoryById(parseInt(this.id));
        this.imgInputclose = false;
        this.addCategory.enable();
        this.isView = false;
      }
    });
  }
  get getCoverImg() {
    var img = this.addCategory.get('categoryImage');
    return img.value ? img.value : null;
  }
  InitFormBuilder() {
    this.addCategory = this.fb.group({
      categoryName: ['', [Validators.required, Validators.maxLength(this.inputTextMaxLength)]],
      categoryShortDesc: ['', Validators.required],
      categoryImage: ['', this.isEditable ? [] : [Validators.required]],
      vendors: ['', Validators.required],
      isPublished: [false],
      categoryImageForView: ['']
    });
  }

  navigateToListpage() {
    this.router.navigate(['/services&technologies']);
  }
  convertToBase64(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.imgInputclose = false;
    reader.onload = () => {
      this.base64String = reader.result;
      this.addCategory.get('categoryImage').setValue(this.base64String);
    };
    reader.readAsDataURL(file);

  }


  togglePublished(event: any) {
    const checked = event.target.checked;
    this.addCategory.get('isPublished').setValue(checked);
  }
  finalPublish() {
    if (this.addCategory.valid) {
      const formValue = this.addCategory.getRawValue();
      formValue.status = formValue.status ? 'true' : 'false'; 
      formValue.vendors = formValue.vendors.map((vendorId: number) => {
        return { vendorId };
      });
      if (this.action !== 'views' && this.action !== 'edits') {
        const addProduct = this.categroyservice.addProduct(formValue).subscribe(
          (response: any) => {
            this.submitLoader = false
            if (response.statusCode == 200) {
              this.webSocketService.sendCategory("LOAD_CATEGORY");
              this.toastr.success("Created Successfully");
              this.navigateToListpage();
              return;
            }
            this.toastr.error(response?.responseMessage);
          });
        this.subscriptions.push(addProduct);
      }
    }
  }

  onSubmit() {

    this.addCategory.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.addCategory.controls).forEach(key => {
      const control = this.addCategory.get(key);
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
    if (emptyRequiredField || this.addCategory.invalid) {
      this.toastr.error(this.invalidFieldErrMsg);
      this.submitLoader = false
      return;
    }
    this.submitLoader = true;
    this.finalPublish();

  }



  disableForm(): void {
    this.addCategory.disable(); 
  }
  dataPatchView() {
    const getCategoryById = this.categroyservice.getCategoryById(this.id).subscribe((res: any) => {
      let vendorsName = res.vendors.map(vendor => vendor.vendorName)
      this.addCategory.patchValue({
        categoryName: res?.categoryName,
        categoryShortDesc: res?.categoryShortDesc,
        vendors: vendorsName,
        isPublished: res?.isPublished,
        categoryImage: res?.categoryImage
      });
      this.coverImg = res?.categoryImageForView || '';
      this.addCategory.get('vendors').patchValue(res.vendors.map(vendor => vendor.vendorId));
    });
    this.subscriptions.push(getCategoryById);
    this.imageUrl = this.addCategory.value.image
  };

  getFullCategoryById(id: number) {
    if (id > 0) {
      const getFullCategory = this.categroyservice.getFullCategoryById(id)
        .subscribe(res => {
          localStorage.setItem('categoryId', res);
          this.categroyservice.fullCategorySubject.next(res);
          let vendorsName = res.vendors.map(vendor => vendor.vendorName)
          this.addCategory.patchValue({
            categoryName: res.categoryName,
            categoryShortDesc: res.categoryShortDesc,
            vendors: vendorsName,
            isPublished: res.isPublished,
            categoryImage: res?.categoryImage
          });
          this.coverImg = res?.categoryImage || '';
          this.addCategory.get('vendors').patchValue(res.vendors.map(vendor => vendor.vendorId));
        });
      this.subscriptions.push(getFullCategory);
      this.imageUrl = this.addCategory.value.image
    }
  }

  get shortDesLen() {
    return this.addCategory.get('categoryShortDesc')?.value?.length || 0;
  }
  update() {

    this.addCategory.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.addCategory.controls).forEach(key => {
      const control = this.addCategory.get(key);
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
    if (emptyRequiredField || this.addCategory.invalid) {
      this.toastr.error(this.invalidFieldErrMsg);
      this.submitLoader = false
      return;
    }

    const formValue = this.addCategory.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';  
    formValue.vendors = formValue.vendors.map((vendorId: number) => {
      return { vendorId };
    });

    this.submitLoader = true;
    const updateAll = this.categroyservice.updateall(formValue, this.id).subscribe(
      (response: any) => {
        if (response.statusCode == 200) {
          this.webSocketService.sendCategory("LOAD_CATEGORY");
          this.toastr.success("Updated Successfully");
          this.submitLoader = false;
          this.addCategory.reset();
          this.navigateToListpage();
        }
      },
      (error) => {
        this.submitLoader = false;
        this.toastr.error("Failed to update category");
      }
    );

    this.subscriptions.push(updateAll);
  }

  changeViewtoEdit() {
    this.addCategory.enable();
    this.action = 'edits';
    this.isView = false;
    this.isEditable = true;
  }

  getallVendorList() {
    const getAllVendor = this.productService.getallvendor().subscribe(
      (response: any) => {
        this.vendorNames = response;

      });
    this.subscriptions.push(getAllVendor);
  }


  getClientFile(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.imgInputclose = false;
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
  };

  ExcelOpertions(event: Event) {
    this.victorImage = !this.victorImage;
  }

  handleImgClick(event: Event) {

    event.stopPropagation();
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
    this.addCategory.get('categoryImage').setValue(this.croppedImage);
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
    const control = this.addCategory.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

}
