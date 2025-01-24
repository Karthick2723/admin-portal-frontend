import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, SecurityContext, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { BannerService } from 'src/app/services/banner.service';
import { InputValidationConstants } from 'src/assets/constants/validaton-text-constants';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-add-banner',
  templateUrl: './add-banner.component.html',
  styleUrls: ['./add-banner.component.scss']
})
export class AddBannerComponent implements OnInit, OnDestroy {
  @ViewChild('cropperModal') cropperModal: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  id: any;
  action: string;
  isView: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false;
  submit: boolean = false;
  update: boolean = false;
  isCropped: boolean = false;
  transform: ImageTransform = {};
  bannerImageView: any[]
  formSubmitted = false;
  formUpdated = false;
  modalReference: NgbModalRef;
  modalRef: NgbModalRef;
  bannerForm: FormGroup;
  bannerList: any[];
  close: boolean = true;
  base64String: string | ArrayBuffer | null = null;
  croppedImage: string = ''; 
  imageChangedEvent: any = ''
  coverImg: string = '';
  invalidFieldsPopupMsg: string = "Please enter the mandatory fields.";
  submitMsg: string = "Banner Creation Successfully";
  updateMsg: string = "Banner Updation Successfully";
  submitFailureMsg: string = "Banner Creation Failed";
  updateFailureMsg: string = "Banner Updation Failed";
  minLenBannerValidationText = InputValidationConstants.minLenBannerValidationText;
  maxLenBannerValidationText = InputValidationConstants.maxLenBannerValidationText;
  minLenValidationText = InputValidationConstants.minLenValidationText;
  maxLenValidationText = InputValidationConstants.maxLenValidationText;
  inputBannerTextMinLength = InputValidationConstants.inputBannerMinContent;
  inputBannerTextMaxLength = InputValidationConstants.inputBannerMaxContent;
  emptyFieldWarningText = 'This field cannot be empty';

  private subscriptions: Subscription[] = [];
  constructor(
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private router: Router,
    private notify: ToastrService,
    private activatedRoute: ActivatedRoute,
    private bannerService: BannerService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.initMethods();
  }

  initMethods() {
    this.initForm();
    this.getQueryParams();
  }

  initForm() {
    this.bannerForm = this.fb.group({
      bannerId: [0],
      bannerContent: ['', [Validators.required, Validators.minLength(this.inputBannerTextMinLength), Validators.maxLength(this.inputBannerTextMaxLength)]],
      bannerImage: ['', [Validators.required]],
      status: [false],
      statusCode: [],
      responseMessage: ['']
    });
  }

  getQueryParams() {
    const queryParams = this.activatedRoute.queryParamMap.subscribe(res => {
      if (res.has('id') && res.has('action')) {
        this.id = parseInt(res.get('id'));
        this.action = res.get('action');

        if (this.action === 'view') {
          this.isView = true;
          this.fetchBannerAndPatchData(this.id);
          this.disableForm();
        } else if (this.action === 'edit') {
          this.isEdit = true;
          this.enableForm();
          this.initForm();
          this.fetchBannerAndPatchData(this.id);
        }
      } else {
        this.isAdd = true;
        this.initForm();
      }
    });
    this.subscriptions.push(queryParams);
  }

  fetchBannerAndPatchData(id: number) {
    if (id) {
      const bannerSubscription = this.bannerService.getBannerById(id)
        .subscribe((response) => {
          this.bannerForm.patchValue({
            bannerId: response?.bannerId,
            bannerContent: response?.bannerContent,
            status: response?.status === 'true',
          });
          this.coverImg = response?.bannerImage || '';
          this.bannerForm.get('bannerImage').setValue(response?.bannerImage);
        });
      this.subscriptions.push(bannerSubscription);
    }
  }

  disableForm() {
    this.bannerForm.disable();
  }

  enableForm() {
    this.bannerForm.enable();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateToBanners() {
    this.router.navigate(['/banner']);
  }

  navigateListPage() {
    this.router.navigate(['/banner']);
  }

  changeViewtoEdit() {
    this.isEdit = true;
    this.isView = false;
    this.enableForm();
  }

  onSubmit() {
    this.bannerForm.markAllAsTouched();
    let hasOnlySpaces = false;
    let emptyValue = false;

    Object.keys(this.bannerForm.controls).forEach(key => {
      const control = this.bannerForm.get(key);

      if (control.value === ' ' || control.value === " ") {
        hasOnlySpaces = true;
      }

      if (control.validator && control.errors) {
        if (control.errors['required']) {
          emptyValue = true;
        }
      }
    });

    if (emptyValue) {
      this.notify.error("Please fill out all required fields.");
      this.submit = false;
      return;
    }

    if (hasOnlySpaces) {
      this.notify.error("Spaces are not allowed in the fields.");
      return;
    }

    this.submit = true;

    const formValue = this.bannerForm.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';
    const createBanner = this.bannerService.createBanner(formValue)
      .subscribe((response) => {
        this.submit = false;

        const statusCode = response?.statusCode;
        let isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 202;
        if (isSuccess) {
          this.webSocketService.sendBanner("LOAD_BANNER");
          this.notify.success(this.submitMsg);
          this.formSubmitted = true;
          this.id = response?.bannerId;
          this.bannerForm.disable();
          this.fetchBannerAndPatchData(parseInt(response?.bannerId));
          this.bannerForm.reset();
          this.router.navigate(['/banner'], { queryParams: { id: response.categoryId, action: 'edits' } });
          this.goBack();
          return;
        }
        this.toastr.error(response?.responseMessage);
      });
    this.subscriptions.push(createBanner);
  }

  discard() {
    this.bannerForm.reset();
    this.navigateListPage();
  }

  bannerFormField(formName: string) {
    return this.bannerForm.get(formName);
  }

  setisPublishedToFg(isPublished: boolean) {
    this.bannerForm.get('status').setValue(isPublished);
  }

  onUpdate() {
    this.bannerForm.markAllAsTouched();

    console.group(this.bannerForm.getRawValue())
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      this.notify.error("Invalid Form field");
      return;
    }
    let hasWhitespaceError = false;

    Object.keys(this.bannerForm.controls).forEach(key => {
      const control = this.bannerForm.get(key);
      const value = control.value;
      const isRequired = control.hasValidator(Validators.required);

      if (isRequired) {
        if (typeof value === 'string' && value.trim().length === 0) {
          hasWhitespaceError = true;
        }
      }
    });

    if (this.bannerForm.invalid || hasWhitespaceError) {
      if (hasWhitespaceError) {
        this.notify.error("Spaces are not allowed in the fields.");
      } else {
        this.notify.error("Please fill out all required fields.");
      }
      this.update = false;
      return;
    }
    this.update = true;

    const formValue = this.bannerForm.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';

    const updateBanner = this.bannerService.updateBanner(this.id, formValue)
      .pipe(
        finalize(() => {
          this.update = false;
        })
      )
      .subscribe((response) => {
        this.update = false;

        const statusCode = response?.statusCode;
        let isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 202;

        if (isSuccess) {
          this.webSocketService.sendBanner("LOAD_BANNER");
          this.id = response?.bannerId;
          this.formUpdated = true;
          this.disableForm();
          this.notify.success(this.updateMsg);
          this.bannerForm.reset();
          this.router.navigate(['/banner'], { queryParams: { id: response.categoryId, action: 'edits' } });
          this.goBack();
          return;
        }
        this.toastr.error(response?.responseMessage);
      });

    this.subscriptions.push(updateBanner);
  }

  goBack() {
    window.history.back();
  }

  setBannerContentToFg(bannerContent: string) {
    this.bannerForm.get('bannerContent').setValue(bannerContent);
  }

  isInValidField(fieldName: string): boolean {
    const control = this.bannerForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  isEmptyField(fieldName: string): boolean {
    const control = this.bannerForm.get(fieldName);
    return control ? control.value.trim().length === 0 : false;
  }

  convertToBase(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.close = false;

    reader.onload = () => {
      this.base64String = reader.result;
      this.bannerForm.get('bannerImage').setValue(this.base64String);
    };
    reader.readAsDataURL(file);
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

  get getCoverImg() {
    return this.bannerForm.get('bannerImage').value || null;
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

  onImageCropped(event: ImageCroppedEvent): void {
    console.log(event);
    this.convertUrlToBase64(event.objectUrl).then(base64 => {
      this.croppedImage = base64; 
      this.bannerForm.get('bannerImage').setValue(this.croppedImage);
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

  onImageLoaded(): void {
    console.log('Image loaded');
  }

  onCropperReady(): void {
    console.log('Cropper ready');
  }

  onLoadImageFailed(): void {
    console.error('Load failed');
  }

  onSaveImages() {
    this.isCropped = true;
    console.log(this.croppedImage);
  }
  get getBannerImg() {
    var img = this.bannerForm.get('bannerImage');
    return img.value ? img.value : null;
  }
}
