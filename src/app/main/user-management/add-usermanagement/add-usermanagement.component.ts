import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/nav/shared/shared.module';
import { CommonserviceService } from 'src/app/services/commonservice.service';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from 'src/app/services/category.service';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/services/product.service';
import { CompressImageService } from 'src/app/services/compress-image.service';
import { take } from 'rxjs';
import { UserManageentService } from 'src/app/services/user-manageent.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent, ImageCropperModule } from 'ngx-image-cropper';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-add-usermanagement',
  standalone: true,
  imports: [CommonModule, SharedModule, MatSelectModule, RouterModule, ImageCropperModule],
  templateUrl: './add-usermanagement.component.html',
  styleUrls: ['./add-usermanagement.component.scss']
})
export class AddUsermanagementComponent {
  @ViewChild('cropperModal') cropperModal: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  imageUrl: string;
  showError: boolean = true;
  imgInputclose: boolean = true;
  isEditable: boolean = false;
  id: any;
  action: any;
  UserDeatils: FormGroup;
  publishbtn: boolean = false;
  productImage: any;
  imagePath: any;
  imageURLs: string | ArrayBuffer;
  base64String: string | ArrayBuffer | null = null;
  firstNames: string;
  viewData = { id: 1, categoryName: 'Mobile', categoryShortDesc: 'Mobile is a electronic device ', imageURL: 'https://picsum.photos/200/300' }
  coverImg: string = '';
  isCropped: boolean = false;
  modalReference: NgbModalRef;
  modalRef: NgbModalRef;
  croppedImage: string = '';
  imageChangedEvent: any = ''
  isView: boolean = false;
  originalEmailId: string;

  constructor(private fb: FormBuilder, private commonserviceService: CommonserviceService,
    private activatedRoute: ActivatedRoute, private categroyservice: CategoryService, private router: Router,
    private toastr: ToastrService, private productService: ProductService,
    private compressImage: CompressImageService, private UserManageentService: UserManageentService,
    private modalService: NgbModal, private cdr: ChangeDetectorRef,
    private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.InitFormBuilder();
    this.activatedRoute.queryParamMap.subscribe(res => {
      this.id = res.get('id');
      this.action = res.get('action');
      if (this.action == 'view') {
        this.dataPatchView();
        this.isEditable = true;
        this.imgInputclose = false;
        this.disableForm();
      }
      if (this.action == 'edit') {
        this.dataPatchView();
        this.imgInputclose = false;
      }
      this.getProfileImageFileName();

    });
  }

  navigateListPage() {
    this.router.navigate(['/UserManagement']);
  }
  InitFormBuilder() {
    this.UserDeatils = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      photoUrl: [''],
      phoneNbr: ['', [Validators.required, Validators.pattern(/^\+91\d{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      clientName: ['', [Validators.required, Validators.maxLength(50)]],
      password: [''],
      address: ['', [Validators.required, Validators.maxLength(150)]],
      status: ['Active'],
      id: [0]
    });
    this.originalEmailId = this.UserDeatils.get('emailId').value;
  }


  isInValidField(formControlName: string): boolean {
    return this.UserDeatils.get(formControlName).invalid && (this.UserDeatils.get(formControlName).dirty ||
      this.UserDeatils.get(formControlName).touched);
  }
  convertToBase64(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.imgInputclose = false;

    reader.onload = () => {
      this.base64String = reader.result;
      this.UserDeatils.get('photoUrl').setValue(this.base64String);
    };

    reader.readAsDataURL(file);
  }

  removeImage() {
    this.base64String = '';
    const uploadElement = document.getElementById('upload_costum') as HTMLInputElement;
    if (uploadElement) {
      uploadElement.value = ''; 
    }
  }

  togglePublished(event: any) {
    const checked = event.target.checked;
    this.UserDeatils.get('status').setValue(checked);
  }
  finalPublish() {
    if (this.UserDeatils.valid) {
      const formValue = this.UserDeatils.getRawValue();
      formValue.status = formValue.status ? 'true' : 'false'; 
      if (this.action !== 'view' && this.action !== 'edit') {
        this.UserManageentService.addUsers(this.UserDeatils.value).subscribe(
          (response: any) => {
            if (response.statusCode == 200) {
              this.toastr.success("User Added Successfully");
              this.UserDeatils.reset();
              this.router.navigate(['/UserManagement']);
            }
            else {
              this.toastr.error(response.message)
            }
          })
      }

    }
  }

  update() {
    this.UserDeatils.get('password').setValue(this.UserDeatils.get('emailId').value);
    this.UserDeatils.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.UserDeatils.controls).forEach(key => {
      const control = this.UserDeatils.get(key);
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
      return;
    }
    if (emptyRequiredField || this.UserDeatils.invalid) {
      this.toastr.error("Please enter the mandatory fields.");
      return;
    }
    if (this.UserDeatils.valid) {
      const formValue = this.UserDeatils.getRawValue();
      formValue.status = formValue.status ? 'true' : 'false';

      this.UserManageentService.updateUser(this.UserDeatils.value, this.id).subscribe(
        (response: any) => {
          if (response.statusCode == 200) {
            this.webSocketService.sendUser("LOAD_USERS");
            this.toastr.success("User Updated Successfully");
            this.UserDeatils.reset();
            this.router.navigate(['/UserManagement']);
          } else {
            this.toastr.error(response.message);
          }
        })
    }
  }

  onSubmit() {
    this.UserDeatils.get('password').setValue(this.UserDeatils.get('emailId').value);
    this.UserDeatils.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.UserDeatils.controls).forEach(key => {
      const control = this.UserDeatils.get(key);
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
      return;
    }
    if (emptyRequiredField || this.UserDeatils.invalid) {
      this.toastr.error("Please enter the mandatory fields.");
      return;
    }

    if (this.UserDeatils.valid) {
      this.finalPublish();
    }
  };


  disableForm(): void {
    this.UserDeatils.disable();
  }
  dataPatchView() {
    this.UserManageentService.getUserDetailsById(this.id).subscribe((res: any) => {
      this.firstNames = res?.firstName ? res?.firstName : '';
      this.UserDeatils.patchValue({
        firstName: res.firstName,
        lastName: res.lastName,
        emailId: res.emailId,
        phoneNbr: res.phoneNbr,
        clientName: res.clientName,
        address: res.address,
        status: res.status == 'Active' ? res.status = 'Active' : 'InActive',
        photoUrl: res.photoUrl
      });
      this.coverImg = res?.photoUrl || '';
    });
    this.imageUrl = this.UserDeatils.value.image
  };

  changeViewtoEdit() {
    this.action = 'edit';
    this.enableForm();
  }

  enableForm() {
    this.UserDeatils.enable();
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
          this.compressImage
            .compress(this.productImage)
            .pipe(take(2))
            .subscribe(compressedImage => {
              this.productImage = compressedImage;
            });

          var reader = new FileReader();
          this.imagePath = files;
          reader.readAsDataURL(files[0]);
          reader.onload = (_event) => {
            this.imageURLs = reader.result;
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

  getProfileImageFileName(): any {
    if (this.firstNames && this.firstNames.length > 0) {
      const firstLetterFirstName = this.firstNames?.charAt(0)?.toUpperCase();
      const fileName = `${firstLetterFirstName}`;
      console.log(fileName);
      return fileName;
    }
  }

  get getCoverImg() {
    var img = this.UserDeatils.get('photoUrl');
    return img.value ? img.value : null;
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
    this.UserDeatils.get('photoUrl')?.setValue(this.croppedImage);
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
    console.log(event);
    this.convertUrlToBase64(event.objectUrl).then(base64 => {
      this.croppedImage = base64; 
      this.UserDeatils.get('photoUrl').setValue(this.croppedImage); 
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

}
