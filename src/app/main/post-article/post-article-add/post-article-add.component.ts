import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, SecurityContext, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CustomEditorImgpopupService } from 'src/app/services/custom-editor-imgpopup.service';
import { PostArticleService } from 'src/app/services/post-article.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { CustomEditorFieldPartitions, CustomEditorImgAlignment, CustomEditorImgFieldPartitions, CustomEditorImgResponsive, CustomEditorSections } from 'src/assets/constants/enums/custom-editor-enums';

@Component({
  selector: 'app-post-article-add',
  templateUrl: './post-article-add.component.html',
  styleUrls: ['./post-article-add.component.scss']
})
export class PostArticleAddComponent implements OnInit {
  @ViewChild('cropperModal') cropperModal: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('editor') editor: any;
  articleForm: FormGroup;
  isView: boolean;
  isEdit: boolean;
  id: number;
  action: string;
  private subscriptions: Subscription[] = [];
  isAdd: boolean;
  customEditorImgResponsive = CustomEditorImgResponsive;
  customEditorImgAlignment = CustomEditorImgAlignment;
  customEditorEnum = CustomEditorSections;
  submit: boolean = false;
  update: boolean = false;
  isEditorDataLoad: boolean = false;
  isPreview: boolean = false;
  isEditor: boolean = true;
  coverImg: any;
  articleTypeOptions: { articleTypeId: number; articleTypeName: string; }[];
  imageChangedEvent: any;
  croppedImage: any;
  customEditorFieldPartitions = CustomEditorFieldPartitions;
  tooltipContent = ['Right Align', 'Left Align', 'Center Align'];
  articleTypes = [];
  tags = [];
  selectedTagIds = [];
  invalidFieldErrMsg: string = "Please enter the mandatory fields.";
  selectedTags: number[];
  receivedData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notify: ToastrService,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
    public sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private imgDialogService: CustomEditorImgpopupService,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private articleService: PostArticleService,
    private webSocketService: WebSocketService,
    private toastr: ToastrService
  ) {

  }

  handleFormDataChanged(updatedData: any[]): void {
    const customEditorsDTOs = this.articleForm.get('customEditorsDTOs') as FormArray;
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
  get customEditorsDTOs(): FormArray {
    return this.articleForm.get('customEditorsDTOs') as FormArray;
  }
  ngOnInit(): void {
    this.initMethods();
    this.commonService.editorImgData.subscribe((response) => {
      if (response != null) {
        const customEditorsArray = this.articleForm.get('customEditorsDTOs') as FormArray;
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
    })
  }

  initMethods() {
    this.initForm();
    this.getQueryParams();
    this.fetchArticleTypes();
    this.fetchArticleTags();
  }
  initForm() {
    this.articleForm = this.fb.group({
      articleId: [0],
      articleName: ['', Validators.required],
      articleImage: ['', Validators.required],
      authorName: ['', Validators.required],
      designation: ['', Validators.required],
      organizationName: ['', Validators.required],
      aboutArticles: ['', Validators.required],
      isPublished: [true],
      domFullContent: [''],
      articleTypeDTO: this.fb.group({
        articleTypeId: ['', Validators.required],
        articleTypeName: [''],
      }),
      customEditorsDTOs: this.fb.array([]),
      articlesTagDTOs: [[], Validators.required]

    });

  }

  addCustomTags(term: any) {
    return {
      articleTagId: 0, articleTagName: term
    }
  }
  togglePublished(event: any) {
    const checked = event.target.checked;
    this.articleForm.get('isPublished').setValue(checked);

  }

  navigateToArticles() {
    this.router.navigate(['/postarticle']);
  }


  get articlesTagFormArray(): FormArray {
    return this.articleForm.get('articlesTagDTOs') as FormArray;
  }


  articleTypeSelect(data: string): void {
    const selectedTypeId = parseInt(data, 10);
    const selectedArticleType = this.articleTypeOptions.find(type => type.articleTypeId === selectedTypeId);
    if (selectedArticleType) {
      const articleTypeFormGroup = this.articleForm.get('articleTypeDTO') as FormGroup;
      articleTypeFormGroup.patchValue({
        articleTypeId: selectedArticleType.articleTypeId,
        articleTypeName: selectedArticleType.articleTypeName
      });
    }
  }
  fetchArticleTypes(): void {
    const getAllArticleTypeSub = this.articleService.getAllArticleType().subscribe(
      (data: { articleTypeId: number, articleTypeName: string }[]) => {
        this.articleTypeOptions = data;
      },
      (error) => {
        console.error('Error fetching article types', error);
      }
    );
    this.subscriptions.push(getAllArticleTypeSub);
  }

  fetchArticleTags(): void {
    const getAllArticleTag = this.articleService.getAllArticleTags().subscribe(res => {
      this.tags = res;
    })
    this.subscriptions.push(getAllArticleTag);
  }
  removeArticleTag(index: number) {
    (this.articleForm.get('articlesTagDTOs') as FormArray).removeAt(index);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSubmit() {

    this.articleForm.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.articleForm.controls).forEach(key => {
      const control = this.articleForm.get(key);
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
      this.submit = false;
      return;
    }
    if (emptyRequiredField) {
      this.toastr.error("Please enter the mandatory fields.");
      this.submit = false;
      return;
    }

    if (this.articleForm.invalid) {
      this.notify.error(this.invalidFieldErrMsg);
      this.submit = false;
      return;
    }

    const source = document.getElementById("previewContent");
    if (source?.innerHTML == undefined || !source?.innerHTML) {
      this.notify.warning("Confirm Full Description");
      return;
    }

    this.articleForm.get('domFullContent').setValue(source?.innerHTML);
    const formValue = this.articleForm.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';
    this.submit = true;
    const createEvent = this.articleService.createArticle(this.articleForm.getRawValue())
      .pipe(finalize(() => {
        this.submit = false;
      }))
      .subscribe(response => {
        this.submit = false;
        if (response?.statusCode === 200) {
          this.webSocketService.sendArticle("LOAD_ARTICLE");
          this.notify.success(response?.responseMessage);
          this.disableForm();
          this.navigateToArticles();
        } else {
          this.notify.error(response?.responseMessage);
        }
      });
    this.subscriptions.push(createEvent);
  }

  changeViewtoEdit() {
    this.isView = false;
    this.isEdit = true;
    this.enableForm();
  }
  get getArticleId() {
    return this.articleForm.get('articleId').value;
  }
  updateArticle() {
    this.articleForm.markAllAsTouched();
    let hasWhitespaceError = false;
    let emptyRequiredField = false;
    Object.keys(this.articleForm.controls).forEach(key => {
      const control = this.articleForm.get(key);
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
      this.submit = false;
      return;
    }
    if (emptyRequiredField) {
      this.toastr.error("Please enter the mandatory fields.");
      this.submit = false;
      return;
    }


    if (this.articleForm.invalid) {
      this.notify.error(this.invalidFieldErrMsg);
      this.submit = false;
      return;
    }
    const source = document.getElementById("previewContent");
    if (source?.innerHTML == undefined || !source?.innerHTML) {
      this.notify.warning("Confirm Full Description");
      return;

    }
    this.articleForm.get('domFullContent').setValue(source?.innerHTML);
    const formValue = this.articleForm.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';
    this.update = true;
    const updateEvent = this.articleService.updateArticle(this.getArticleId, this.articleForm.value)
      .pipe(
        finalize(() => {
          this.update = false;
        })
      )
      .subscribe((response) => {
        this.update = false;
        if (response?.statusCode == 200) {
          this.webSocketService.sendArticle("LOAD_ARTICLE");
          this.notify.success(response?.responseMessage);
          this.disableForm();
          this.navigateToArticles();
          return;
        }
        this.notify.error(response?.responseMessage);

      });

    this.subscriptions.push(updateEvent);
  }
  getQueryParams() {
    const queryParam = this.activatedRoute.queryParamMap.subscribe(res => {
      if (res.has('id') && res.has('action')) {
        this.id = parseInt(res.get('id'));
        this.action = res.get('action');
        if (this.action === 'view') {
          this.isView = true;
          this.isEdit = false;
          this.fetchArticleAndPatchData(this.id);
          this.disableForm();
        } else if (this.action === 'edit') {
          this.isEdit = true;
          this.isView = false;
          this.enableForm();
          this.fetchArticleAndPatchData(this.id);
        }
      } else {
        this.isAdd = true;
      }
    });
    this.subscriptions.push(queryParam);
  }
  disableForm() {
    this.articleForm.disable();
  }
  enableForm() {
    this.articleForm.enable();
  }

  discardForm() {
    this.articleForm.reset();
    this.navigateToArticles();
  }
  fetchArticleAndPatchData(id: number) {
    this.isEditorDataLoad = true;
    const getArticle = this.articleService.getArticleById(id).subscribe((response) => {
      if (response) {
        const customEditorsDTOsArray = this.articleForm.get('customEditorsDTOs') as FormArray;
        if (response?.customEditorsDTOs) {
          this.receivedData = [];
          this.receivedData = response.customEditorsDTOs;
          this.handleFormDataChanged(response.customEditorsDTOs);
        }
        this.isEditorDataLoad = false;

        const articleTypeDTOGroup = this.articleForm.get('articleTypeDTO') as FormGroup;
        if (response?.articleTypeDTO) {
          articleTypeDTOGroup.patchValue({
            articleTypeId: response.articleTypeDTO?.articleTypeId || 0,
            articleTypeName: response.articleTypeDTO?.articleTypeName || '',
          });
        }
        this.articleForm.patchValue({
          articleId: response?.articleId,
          articleName: response?.articleName,
          type: response?.type,
          designation: response?.designation,
          articleImage: response?.articleImage,
          authorName: response?.authorName,
          organizationName: response?.organizationName,
          aboutArticles: response?.aboutArticles,
          domFullContent: response?.domFullContent,
          isPublished: response?.isPublished,
          statusCode: response?.statusCode,
          responseMessage: response?.responseMessage,
          articlesTagDTOs: response?.articlesTagDTOs
        });
        this.coverImg = response?.articleImage || '';
        const articlesTagArray = this.articleForm.get('articlesTagDTOs') as FormArray;
        if (response?.articlesTagDTOs) {
          this.tags = response?.articlesTagDTOs;
          response?.articlesTagDTOs.forEach((term, i) => {
            this.selectedTagIds.push(term.articleTagId)
          });
        }
      }
    });
    this.subscriptions.push(getArticle);
  }
  setisPublishedToFg(isPublished: boolean) {
    this.articleForm.get('isPublished').setValue(isPublished);
  }
  isInValidField(formControlName: string): boolean {
    const control = this.articleForm.get(formControlName);
    return control && control.invalid && (control.dirty || control.touched);
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

  resetFileInput(): void {
    const input = this.fileInput.nativeElement as HTMLInputElement;
    input.value = '';
    this.cdr.detectChanges();
  }
  confirmCrop(modal: any, formControlName: string): void {
    this.coverImg = this.croppedImage; 
    this.articleForm.get(formControlName)?.setValue(this.croppedImage);
    this.articleForm.get('articleImage')?.setValue(this.croppedImage);
    this.resetFileInput();
    modal.close();

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


}
