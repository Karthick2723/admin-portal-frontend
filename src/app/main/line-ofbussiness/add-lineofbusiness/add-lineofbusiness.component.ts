import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from 'src/app/nav/shared/shared.module';
import { CategoryService } from 'src/app/services/category.service';
import { CommonserviceService } from 'src/app/services/commonservice.service';
import { LineOfbussinessService } from 'src/app/services/line-ofbussiness.service';
import { ProductService } from 'src/app/services/product.service';
import { CompressImageService } from 'src/app/services/compress-image.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-add-lineofbusiness',
  standalone: true,
  imports: [CommonModule, SharedModule, MatSelectModule, RouterModule],
  templateUrl: './add-lineofbusiness.component.html',
  styleUrls: ['./add-lineofbusiness.component.scss']
})
export class AddLineofbusinessComponent {
  imageUrl: string;
  showError: boolean = true;
  imgInputclose: boolean = true;
  isEditable: boolean = false;
  id: any;
  vendorArrays = [];
  action: any;
  vendorNames: any;
  lobForm: FormGroup;
  publishbtn: boolean = false;
  productImage: any;
  imagePath: any;
  imgURL: string | ArrayBuffer;
  base64String: string | ArrayBuffer | null = null;
  categoryId: any;
  viewData = { id: 1, lobName: 'Mobile', lobDesc: 'Mobile is a electronic device ', categoryImage: 'https://picsum.photos/200/300' }

  constructor(private fb: FormBuilder, private commonserviceService: CommonserviceService, private categroyservice: CategoryService,
    private activatedRoute: ActivatedRoute, private lobService: LineOfbussinessService, private router: Router,
    private toastr: ToastrService, private productService: ProductService,
    private compressImage: CompressImageService) {

  }

  ngOnInit() {
    this.InitFormBuilder();
    this.getallVendorList();
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
    });
    this.categoryId = localStorage.getItem('categoryId');
  }

  InitFormBuilder() {
    this.lobForm = this.fb.group({
      lobName: ['', Validators.required],
      lobDesc: [''],
      lobImage: [],
      vendorId: ['', Validators.required],
      isPublished: [false]
    });
  }
  convertToBa(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    this.imgInputclose = false;

    reader.onload = () => {
      this.base64String = reader.result;
      this.lobForm.get('lobImage').setValue(this.base64String);
    };

    reader.readAsDataURL(file);
  }


  togglePublished(event: any) {
    const checked = event.target.checked;
    this.lobForm.get('isPublished').setValue(checked);
  }
  finalPublish() {
    if (this.lobForm.valid) {
      if (this.action !== 'view' && this.action !== 'edit') {
        this.lobService.addLob(this.lobForm.value).subscribe(

          (response: any) => {
            if (response.statusCode == 200) {
              this.toastr.success("Bussiness Added Successfully");
              this.lobForm.reset();
              this.router.navigate(['/add-category'], { queryParams: { id: this.categoryId, action: 'edits' } });

            }
          })
      }


    }
  }

  onSubmit() {

    this.lobForm.markAllAsTouched();
    if (this.lobForm.valid) {
      this.finalPublish();
      this.lobForm.value.vendors = this.lobForm.value.vendors.map((vendorId: number) => {
        return { vendorId };
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.imageUrl = reader.result as string;
      if (this.imageUrl) {
        this.imgInputclose = false;
      }

    };

    reader.readAsDataURL(file);

  }

  disableForm(): void {
    this.lobForm.disable(); 
  }
  dataPatchView() {

    this.lobService.getLobById(this.id).subscribe((res: any) => {
      this.lobForm.patchValue({
        lobName: res.lobName,
        lobDesc: res.lobDesc,
        vendorId: res.vendor.vendorId,
        isPublished: res.isPublished,
      });
      this.base64String = res.lobImage
    });

    this.imageUrl = this.lobForm.value.image
  };


  update() {
    this.lobForm.markAllAsTouched();
    if (this.lobForm.valid) {
      if (this.base64String == null) {
      }
      this.lobForm.get('lobImage').patchValue(this.base64String)
      this.lobForm.value.lobImage = this.base64String;
      this.lobService.updateall(this.lobForm.value, this.id).subscribe(
        (response: any) => {
          if (response.statusCode == 200) {
            this.toastr.success("Bussiness Updated Successfully");
            this.lobForm.reset();
            this.router.navigate(['/add-category'], { queryParams: { id: this.categoryId, action: 'edits' } });
          }
        })

    }
  }
  changeViewtoEdit() {
    this.lobForm.enable();
    this.action = 'edit';
  }
  getallVendorList() {

    this.productService.getallvendor().subscribe(
      (response: any) => {
        this.vendorNames = response;
      })
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
}
