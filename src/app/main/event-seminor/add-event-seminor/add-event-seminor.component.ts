import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ToastrService } from 'ngx-toastr';
import { Subscription, finalize } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CustomEditorImgpopupService } from 'src/app/services/custom-editor-imgpopup.service';
import { EventSeminorService } from 'src/app/services/event-seminor.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { CustomEditorFieldPartitions, CustomEditorImgAlignment, CustomEditorImgFieldPartitions, CustomEditorImgResponsive, CustomEditorSections } from 'src/assets/constants/enums/custom-editor-enums';
import { InputValidationConstants } from 'src/assets/constants/validaton-text-constants';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-event-seminor',
  templateUrl: './add-event-seminor.component.html',
  styleUrls: ['./add-event-seminor.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class AddEventSeminorComponent implements OnInit, OnDestroy {
  @ViewChild('cropperModal') cropperModal: TemplateRef<any>;
  @ViewChild('cropperModalForPresenter') cropperModalForPresenter: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('editor') editor: any;

  html = '';
  eventForm: FormGroup;
  id: any;
  action: string;
  isView: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false;
  eventTypeOptions: { eventTypeId: number; eventTypeName: string; }[];
  submit: boolean = false;
  update: boolean = false;
  contentHeight = 200;
  inputTextMinLength = InputValidationConstants.inputTextMinLength;
  inputTextMaxLength = InputValidationConstants.inputTextMaxLength;
  inputPhMinCount = InputValidationConstants.inputPhMinCount;
  inputPhMaxCount = InputValidationConstants.inputPhMaxCount;
  minLenValidationText = InputValidationConstants.minLenValidationText;
  maxLenValidationText = InputValidationConstants.maxLenValidationText;
  phNoMinValidationCount = InputValidationConstants.phNoMinValidationCount;
  phNoMaxValidationCount = InputValidationConstants.phNoMaxValidationCount;
  emailValidationText = InputValidationConstants.emailValidationText;
  timeValidationText = InputValidationConstants.timeValidationText;
  customEditorImgResponsive = CustomEditorImgResponsive;
  customEditorImgAlignment = CustomEditorImgAlignment;
  invalidFieldErrMsg: string = "Please enter the mandatory fields.";
  isCropped: boolean = false;
  modalReference: NgbModalRef;
  modalRef: NgbModalRef;
  croppedImage: string = '';
  imageChangedEvent: any = ''
  coverImg: string = '';
  private subscriptions: Subscription[] = [];
  private observer: MutationObserver;
  maxDateTimeRow: number = 24;
  isEditorDataLoad: boolean = false;
  minDate: string;
  focusTimePicker: string = '';
  receivedData: any[] = [];
  registeredCount: number=0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _eventSeminorService: EventSeminorService,
    private notify: ToastrService,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
    public sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private imgDialogService: CustomEditorImgpopupService,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private webSocketService: WebSocketService,
    private toastr: ToastrService
  ) { }

  onFocusTimePicker(type: string) {
    this.focusTimePicker = type;
  }

  onToggleDropdown(visible: boolean, type: string) {
    if (visible) {
      this.focusTimePicker = type;
    } else {
      if (this.focusTimePicker === type) {
        this.focusTimePicker = '';
      }
    }
  }
  setDate(index: number, $event: any) {
    this.eventDateTimesArrField(index, 'eventDate').setValue($event.target.value);
  }
  reciveFromTime($event: any, index: number, formControlName: string) {
    this.eventDateTimesArrField(index, formControlName).setValue(this.convertTimeObjectToString($event));
    this.eventDateTimesArrField(index, 'eventFromTime').setValue(this.convertTimeObjectToString($event));
    this.getEventDateTimes(index);
    this.isSameFromToTimeValidation();
  }

  reciveToTime($event: any, index: number, formControlName: string) {
    this.eventDateTimesArrField(index, formControlName).setValue(this.convertTimeObjectToString($event));
    this.eventDateTimesArrField(index, 'eventToTime').setValue(this.convertTimeObjectToString($event));
    this.getEventDateTimes(index);
    this.isSameFromToTimeValidation();
  }

  convertTimeObjectToString(time: { hour: number; minute: number; second: number }): string {
    const formattedHour = time.hour.toString().padStart(2, '0');
    const formattedMinute = time.minute.toString().padStart(2, '0');
    const formattedSecond = time?.second?.toString()?.padStart(2, '0');
    return `${formattedHour}:${formattedMinute}:${formattedSecond}`;
  }

  ngOnInit(): void {

    this.minDate = new Date().toISOString().split('T')[0];;
    this.initMethods();
    this.commonService.editorImgData.subscribe((response) => {
      if (response != null) {
        const customEditorsArray = this.eventForm.get('customEditorsDTOs') as FormArray;
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

  }
  ngAfterViewInit() { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForm() {
    this.eventForm = this.fb.group({
      eventType: this.fb.group({
        eventTypeId: [0]
      }),
      eventId: [],
      eventName: ['', [Validators.required, Validators.maxLength(250)]],
      eventDesc: [''],
      eventShortDesc: ['', [Validators.required, Validators.maxLength(250)]],
      eventImg: ['', [Validators.required]],
      isPublished: [true],
      eventDetails: this.fb.group({
        eventDetailsId: [],
        organizer: ['', [Validators.required, Validators.maxLength(100)]],
        title: ['', [Validators.required, Validators.maxLength(250)]],
        contents: ['', [Validators.required, Validators.maxLength(250)]],
        deadline: ['', [Validators.required]], // 
        sponsorship: ['', [Validators.required, Validators.maxLength(100)]],
        location: ['', [Validators.required, Validators.maxLength(100)]],
        stallNo: [''],
        substance: [''],
        target: [''],
        participationFee: ['', Validators.required],
        capacity: [, [Validators.required, Validators.min(this.registeredCount)]],
        capacityCondition: [''],
        contactUs: [''],
        detailedInfo: [''],

        eventFormEventType: [, [Validators.required]],
        eventFormEventName: ['', [Validators.required, Validators.maxLength(250)]],
        eventFormEventDesc: [''],
        eventFormeventShortDesc: ['', [Validators.required, Validators.minLength(this.inputTextMinLength), Validators.maxLength(this.inputTextMaxLength)]],//eventShortDesc
        eventFormEventImg: [''],
        eventFormIsPublished: [''],
        eventFromTimeUi: [],
        eventToTimeUi: [],
        eventFromTelephoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        eventFromEmailAddress: ['', [Validators.required, Validators.email]],
        eventFromCompanyName: ['', [Validators.required, Validators.maxLength(100)]],
        eventFromDepartmentName: ['', [Validators.required, Validators.maxLength(100)]],
        eventDateTimes: this.fb.array([
          this.fb.group({
            eventDateTimeId: [],
            eventDate: ['', [Validators.required]],
            eventFromTime: ['', [Validators.required]],
            eventToTime: ['', [Validators.required]],
            eventDateView: ['', [Validators.required]],
            eventFromTimeView: ['00:00:00', [Validators.required]],
            eventToTimeView: ['00:00:00', [Validators.required]],
            isViewAddRow: [true],
            isTimeSlotOverlap: [false],
            timeSlotOverlapErrMsg: [''],
            isFromToSameTime: [false]
          }, { validator: [this.timeComparisonValidator] })
        ]),
        presenterDetails: this.fb.group({
          teacherName: ['', [Validators.required, Validators.maxLength(50)]],
          department: ['', [Validators.required, Validators.maxLength(50)]],
          designation: ['', [Validators.required, Validators.maxLength(50)]],
          skills: ['', [Validators.required, Validators.maxLength(50)]],
          aboutPresenter: ['', [Validators.required, Validators.maxLength(250)]],
          presenterImage: ['', [Validators.required]],
          presentDetailsId: [0],
        })
      }),
      inquiries: this.fb.array([this.createInquiry()]),
      domFullContent: [''],
      customEditorsDTOs: this.fb.array([])
    });
  }

  get customEditorsDTOs(): FormArray {
    return this.eventForm.get('customEditorsDTOs') as FormArray;
  }

  handleFormDataChanged(updatedData: any[]): void {
    const customEditorsDTOs = this.eventForm.get('customEditorsDTOs') as FormArray;
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
  get eventDateandTimeArr(): FormArray {
    return this.eventForm.get('eventDetails.eventDateTimes') as FormArray;
  }

  addEventDateTime() {
    if (this.eventDateandTimeArr.length <= this.maxDateTimeRow) {
      this.eventDateandTimeArr.push(this.fb.group({
        eventDateTimeId: [],
        eventDate: ['', [Validators.required]],
        eventFromTime: ['', [Validators.required]],
        eventToTime: ['', [Validators.required]],
        eventDateView: ['', [Validators.required]],
        eventFromTimeView: ['00:00:00', [Validators.required]],
        eventToTimeView: ['00:00:00', [Validators.required]],
        isViewAddRow: [false],
        isTimeSlotOverlap: [false],
        timeSlotOverlapErrMsg: [''],
        isFromToSameTime: [false]
      }, {
        validator:
          [this.timeComparisonValidator]
      }));
      this.isSameFromToTimeValidation();
      this.addRowViewCondition();
    }

  }

  timeComparisonValidator(group: any): { [key: string]: any } | null {
    const eventDateView = group.get('eventDateView').value;
    const eventFromTimeView = group.get('eventFromTimeView').value;
    const eventToTimeView = group.get('eventToTimeView').value;

    if (eventFromTimeView && eventToTimeView && eventFromTimeView > eventToTimeView) {
      return { timeComparison: true };
    }
    return null;
  }

  hasTimeComparisonError(index: number): boolean {
    const formGroup = this.eventDateandTimeArr.at(index) as FormGroup;
    return formGroup.hasError('timeComparison');
  }
  getEventDateTimes(index: number) {
    const enteredDate = this.eventDateandTimeArr.controls[index].get('eventDateView').value;
    const enteredFromTime = this.eventDateandTimeArr.controls[index].get('eventFromTimeView').value;
    const enteredToTime = this.eventDateandTimeArr.controls[index].get('eventToTimeView').value;
    this.eventDateandTimeArr.controls[index].get('isTimeSlotOverlap').setValue(false);
    this.eventDateandTimeArr.controls[index].get('timeSlotOverlapErrMsg').setValue('');
    if (enteredDate && enteredFromTime && enteredToTime) {
      for (let i = 0; i < this.eventDateandTimeArr.controls.length; i++) {
        if (i !== index) {
          const exsistDate = this.eventDateandTimeArr.controls[i].get('eventDateView').value;
          const exsistFromTime = this.eventDateandTimeArr.controls[i].get('eventFromTimeView').value;
          const exsistToTime = this.eventDateandTimeArr.controls[i].get('eventToTimeView').value;
          if (
            enteredDate === exsistDate &&
            enteredFromTime === exsistFromTime &&
            enteredToTime === exsistToTime
          ) {
            this.eventDateandTimeArr.controls[index].get('isTimeSlotOverlap').setValue(true);
            this.eventDateandTimeArr.controls[index].get('timeSlotOverlapErrMsg').setValue('Duplicate Time Slot');
            return;
          }
          const enteredDateMoment = moment(enteredDate);
          const exsistDateMomemt = moment(exsistDate);
          const enteredFromMoment = moment(enteredFromTime, 'HH:mm');
          const enteredToMoment = moment(enteredToTime, 'HH:mm');
          const exsistFromMoment = moment(exsistFromTime, 'HH:mm');
          const exsistToMoment = moment(exsistToTime, 'HH:mm');

          if (
            (enteredDateMoment.isSame(exsistDateMomemt) && enteredFromMoment.isSameOrAfter(exsistFromMoment) && enteredFromMoment.isBefore(exsistToMoment)) ||
            (enteredDateMoment.isSame(exsistDateMomemt) && enteredToMoment.isAfter(exsistFromMoment) && enteredToMoment.isSameOrBefore(exsistToMoment)) ||
            (enteredDateMoment.isSame(exsistDateMomemt) && exsistFromMoment.isSameOrAfter(enteredFromMoment) && exsistFromMoment.isBefore(enteredToMoment)) ||
            (enteredDateMoment.isSame(exsistDateMomemt) && exsistToMoment.isAfter(enteredFromMoment) && exsistToMoment.isSameOrBefore(enteredToMoment))
          ) {
            this.eventDateandTimeArr.controls[index].get('isTimeSlotOverlap').setValue(true);
            this.eventDateandTimeArr.controls[index].get('timeSlotOverlapErrMsg').setValue('Time Slot Overlap');
            return;
          }
        }
      }
    }
  }


  checkTimeOverlap(
    date1: string,
    fromTime1: string,
    toTime1: string,
    date2: string,
    fromTime2: string,
    toTime2: string
  ): boolean {
    const dateMoment1 = moment(date1);
    const dateMoment2 = moment(date2);
    const fromMoment1 = moment(fromTime1, 'HH:mm');
    const toMoment1 = moment(toTime1, 'HH:mm');
    const fromMoment2 = moment(fromTime2, 'HH:mm');
    const toMoment2 = moment(toTime2, 'HH:mm');

    return (
      (dateMoment1.isSame(dateMoment2) &&
        (fromMoment1.isSameOrAfter(fromMoment2) && fromMoment1.isBefore(toMoment2)) ||
        (toMoment1.isAfter(fromMoment2) && toMoment1.isSameOrBefore(toMoment2))) ||
      (dateMoment1.isSame(dateMoment2) &&
        (fromMoment2.isSameOrAfter(fromMoment1) && fromMoment2.isBefore(toMoment1)) ||
        (toMoment2.isAfter(fromMoment1) && toMoment2.isSameOrBefore(toMoment1)))
    );
  }


  hasTimeSlotOverlap(i: number, formControlName: string) {
    return this.eventDateandTimeArr.at(i).get(formControlName);
  }

  discardForm() {
    this.eventForm.reset();
    this.eventDateTimeArr.clear();
    this.eventDateTimeArr.push(this.fb.group({
      eventDateTimeId: [],
      eventDate: ['', [Validators.required]],
      eventFromTime: ['', [Validators.required]],
      eventToTime: ['', [Validators.required]],
      eventDateView: ['', [Validators.required]],
      eventFromTimeView: ['', [Validators.required]],
      eventToTimeView: ['', [Validators.required]],
      isViewAddRow: [true]
    }));

    this.navigateToEvents();
  }
  updateContentHeight(event: any) {
    const editorContent = event?.editor?.root?.innerHTML || '';
    const numLines = editorContent.split('<br>').length;
    const lineHeight = 20;
    const calculatedHeight = numLines * lineHeight;
    this.contentHeight = Math.max(calculatedHeight, 200);
  }

  addRowViewCondition() {
    this.eventDateandTimeArr.controls.forEach((e, i) => {
      var lastIndex = this.eventDateandTimeArr.controls.length - 1;
      e.get('isViewAddRow').setValue(false);
      if (lastIndex == i) {
        e.get('isViewAddRow').setValue(true);
        return
      }
    });
  }

  getIsViewAddRow(index: any) {
    return this.eventDateandTimeArr.at(index).get('isViewAddRow').value;
  }

  removeEventDateTime(index: number) {
    if (this.eventDateandTimeArr.controls.length - 1 > 0) {
      this.eventDateandTimeArr.removeAt(index);
      this.addRowViewCondition();
    }

  }

  createInquiry(): FormGroup {
    return this.fb.group({
      inquiryId: [],
      telephoneNumber: [''],
      emailAddress: [''],
      companyName: [''],
      departmentName: [''],
    });
  }

  createInquiryView(data: any) {
    return this.fb.group({
      inquiryId: data.inquiryId,
      telephoneNumber: data.telephoneNumber,
      emailAddress: data.emailAddress,
      companyName: data.companyName,
      departmentName: data.departmentName,
    });

  }
  registerCount(registerCount: string): number {
    if (registerCount) {
      // Split the string by '/' and get the first part
      const beforeSlash = registerCount.split('/')[0];
      // Convert the string to a number
      const result = Number(beforeSlash);
      return result;
    } else {
      return 0;
    }
  }
  fetchEventAndPatchData(id: number) {
    this.isEditorDataLoad = true;
    const getEvent = this._eventSeminorService.getEvent(id)
      .subscribe((response) => {
        if (response) {
          this.registeredCount = this.registerCount(response?.eventDetails?.registeredCount);
          if (response?.customEditorsDTOs) {
            this.receivedData = [];
            this.receivedData = response.customEditorsDTOs;
            this.handleFormDataChanged(response.customEditorsDTOs);
          }
          this.isEditorDataLoad = false;
          this.eventForm.patchValue({
            eventId: response?.eventId,
            eventName: response?.eventName,
            eventDesc: response?.eventDesc,
            eventShortDesc: response?.eventShortDesc,
            isPublished: response?.isPublished,
            eventImg: response?.eventImg,
            eventOtherImg: response?.eventOtherImg,
            statusCode: response?.statusCode,
            resultMessage: response?.responseMessage,
            eventTypeId: response?.eventTypeId,
            domFullContent: response?.domFullContent
          });
          this.coverImg = response?.eventImg || '';
          this.eventForm.get('eventType').patchValue({
            eventTypeId: response.eventType.eventTypeId,
          });
          this.eventForm.get('eventDetails').patchValue({
            eventDetailsId: response?.eventDetails?.eventDetailsId,
            title: response?.eventDetails?.title,
            contents: response?.eventDetails?.contents,
            deadline: response?.eventDetails?.deadline,
            sponsorship: response?.eventDetails?.sponsorship,
            eventFromDateTime: response?.eventDetails?.eventFromDateTime,
            eventToDateTime: response?.eventDetails?.eventToDateTime,
            location: response?.eventDetails?.location,
            stallNo: response?.eventDetails?.stallNo,
            substance: response?.eventDetails?.substance,
            target: response?.eventDetails?.target,
            participationFee: response?.eventDetails?.participationFee,
            capacity: response?.eventDetails?.capacity,
            capacityCondition: response?.eventDetails?.capacityCondition,
            contactUs: response?.eventDetails?.contactUs,
            detailedInfo: response?.eventDetails?.detailedInfo,
            statusCode: response?.eventDetails?.statusCode,
            responseMessage: response?.eventDetails?.responseMessage,
            eventId: response?.eventDetails?.eventId,
            organizer: response?.eventDetails?.organizer,

            eventFormEventType: response.eventType.eventTypeId,
            eventFormEventName: response.eventName,
            eventFormEventDesc: response.eventDesc,
            eventFormeventShortDesc: response.eventShortDesc,
            eventFormIsPublished: response.isPublished,
            eventFromTimeUi: this.convertDateTimeToTime(response?.eventDetails?.eventFromDateTime),
            eventToTimeUi: this.convertDateTimeToTime(response?.eventDetails?.eventToDateTime),

          });
          this.eventForm.get('eventDetails').get('presenterDetails').patchValue({
            teacherName: response?.eventDetails?.presenterDetails?.teacherName,
            department: response?.eventDetails?.presenterDetails?.department,
            designation: response?.eventDetails?.presenterDetails?.designation,
            skills: response?.eventDetails?.presenterDetails?.skills,
            aboutPresenter: response?.eventDetails?.presenterDetails?.aboutPresenter,
            presenterImage: response?.eventDetails?.presenterDetails?.presenterImage,
            presentDetailsId: response?.eventDetails?.presenterDetails?.presentDetailsId
          });
          this.eventForm.get('eventDetails').get('eventFromCompanyName').setValue(response?.inquiries[0]?.companyName);
          this.eventForm.get('eventDetails').get('eventFromDepartmentName').setValue(response?.inquiries[0].departmentName);
          this.eventForm.get('eventDetails').get('eventFromTelephoneNumber').setValue(response?.inquiries[0]?.telephoneNumber);
          this.eventForm.get('eventDetails').get('eventFromEmailAddress').setValue(response?.inquiries[0]?.emailAddress);
          const inquiriesArray = this.eventForm.get('inquiries') as FormArray;
          inquiriesArray.clear();
          inquiriesArray.push(this.createInquiryView(response.inquiries[0]));
          const eventDateTimeRes = response?.eventDetails?.eventDateTimes;
          this.eventDateandTimeArr.clear();
          eventDateTimeRes.forEach((e, i) => {
            this.eventDateandTimeArr.push(this.fb.group({
              eventDateTimeId: response?.eventDetails?.eventDateTimes[i]?.eventDateTimeId,
              eventDate: response?.eventDetails?.eventDateTimes[i]?.eventDate,
              eventFromTime: response?.eventDetails?.eventDateTimes[i]?.eventFromTime,
              eventToTime: response?.eventDetails?.eventDateTimes[i]?.eventToTime,
              eventDateView: response?.eventDetails?.eventDateTimes[i]?.eventDate,
              eventFromTimeView: response?.eventDetails?.eventDateTimes[i]?.eventFromTime,
              eventToTimeView: response?.eventDetails?.eventDateTimes[i]?.eventToTime,
              isViewAddRow: [false],
              isTimeSlotOverlap: [false],
              timeSlotOverlapErrMsg: [''],

              isFromToSameTime: [false]
            })
            );
          });
          this.addRowViewCondition();
          if (this.isView) {
            this.disableEventDateTimeArray();
            return;
          }
          this.enableEventDateTimeArray();

        }

      });
    this.subscriptions.push(getEvent);
  }

  disableEventDateTimeArray() {
    this.eventDateandTimeArr.controls.forEach((control) => {
      Object.keys(control['controls']).forEach((key) => {
        control.get(key).disable();
      });
    });

  }

  enableEventDateTimeArray() {
    this.eventDateandTimeArr.controls.forEach((control) => {
      Object.keys(control['controls']).forEach((key) => {
        control.get(key).enable();
      });
    });

  }


  navigateToEvents() {
    this.router.navigate(['/events']);
  }

  getQueryParams() {
    const queryParam = this.activatedRoute.queryParamMap.subscribe(res => {
      if (res.has('id') && res.has('action')) {
        this.id = parseInt(res.get('id'));
        this.action = res.get('action');
        if (this.action === 'view') {
          this.isView = true;
          this.fetchEventAndPatchData(this.id);
          this.disableForm()
        } else if (this.action === 'edit') {
          this.isEdit = true;
          this.enableForm();
          this.fetchEventAndPatchData(this.id);
        }
      } else {
        this.isAdd = true;
      }
    });
    this.subscriptions.push(queryParam);
  }
  disableForm() {
    this.eventForm.disable();
  }
  enableForm() {
    this.eventForm.enable();
  }
  changeViewtoEdit() {
    this.isEdit = true;
    this.isView = false;
    this.enableForm();
  }
  get getEventId() {
    return this.eventForm.get('eventId').value;
  }
  updateEvent() {

    this.seteventDescToFg();
    this.converteventDateandTimeFieldFormat();
    this.eventDateTimeArr.controls.forEach((d, i) => {
      const eventDateView = d.get('eventDateView')?.value;
      const eventFromTimeView = d.get('eventFromTimeView')?.value;
      const eventToTimeView = d.get('eventToTimeView')?.value;
      d.patchValue({
        eventDate: eventDateView,
        eventFromTime: eventFromTimeView,
        eventToTime: eventToTimeView
      });

    });
    this.isSameFromToTimeValidation();
    this.eventForm.markAllAsTouched();
    let hasOnlySpaces = false;
    let emptyvalue = false;
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          const nestedControl = control.get(nestedKey);
          const nestedValue = nestedControl?.value;
          const isNestedRequired = nestedControl?.hasValidator(Validators.required);
          if (isNestedRequired) {
            if (nestedValue && typeof nestedValue === 'string' && nestedValue.trim().length === 0) {
              hasOnlySpaces = true;
            }

            if (nestedValue === null || nestedValue === '') {
              emptyvalue = true;
            }
          }
        });
      }
    });

    if (emptyvalue) {
      this.notify.error("Please fill out all required fields.");
      this.submit = false;
      return;
    }

    if (hasOnlySpaces) {
      this.notify.error("Spaces are not allowed");
      return;
    }
    const isAnyTimeInvalid = this.checkIfAnyTimeIsInvalid();
    if (isAnyTimeInvalid) {
      this.notify.error('Same event from and to time exisist');
      return;
    }

    if (this.eventForm.invalid || this.eventDateTimeArrInvalid) {
      this.eventForm.markAllAsTouched();
      this.notify.error(this.invalidFieldErrMsg);
      this.update = false;
      return;
    }
    const source = document.getElementById("previewContent");
    if (source?.innerHTML == undefined || !source?.innerHTML) {
      this.notify.warning("Confirm Full Description");
      return;

    }
    this.eventForm.get('domFullContent').setValue(source?.innerHTML);
    const formValue = this.eventForm.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';
    this.update = true;
    const updateEvent = this._eventSeminorService.updateEvent(this.getEventId, this.eventForm.value)
      .pipe(
        finalize(() => {
          this.update = false;
        })
      )
      .subscribe((response) => {
        this.update = false;

        if (response?.statusCode == 200) {
          this.webSocketService.sendEventPublish("LOAD_EVENTS")
          this.webSocketService.sendEventPublish("UPDATE_YEARS");
          this.notify.success(response?.responseMessage);
          this.disableForm();
          this.navigateToEvents();
          return;
        }

        this.notify.error(response?.responseMessage);

      });

    this.subscriptions.push(updateEvent);
  }

  fetchEventTypes(): void {

    const getAllEventsType = this._eventSeminorService.getAllEventsType().subscribe(
      (data: { eventTypeId: number, eventTypeName: string }[]) => {
        this.eventTypeOptions = data;
      }
    );
    this.subscriptions.push(getAllEventsType);
  }
  convertImgFormatBase64(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const newreader = new FileReader();

      newreader.onload = () => {
        this.eventForm.get('eventDetails.presenterDetails.presenterImage').patchValue(newreader.result);
      };
      newreader.readAsDataURL(file);
    }
  }
  get getPresenterImg() {
    var img = this.eventForm.get('eventDetails.presenterDetails.presenterImage');
    return img.value ? img.value : null;
  }


  openImgEditorPopup(data: any, index: number) {
    this.imgDialogService.openModal("Custom Editor", "Img Popup", data, this.isView, index, () => {
    }, () => {
    });
  }
  get getCoverImg() {
    var img = this.eventForm.get('eventImg');
    return img.value ? img.value : null;
  }


  initMethods() {
    this.initForm();
    this.getQueryParams();
    this.fetchEventTypes();
  }
  eventTypeSelect(data: string) {
    const selectedEventType = this.eventTypeOptions.find(type => type.eventTypeId == parseInt(data));
    if (selectedEventType) {
      this.eventForm.get('eventType.eventTypeId').setValue(parseInt(data));
    }
  }

  get eventDateTimeArr(): FormArray {
    return this.eventForm.get('eventDetails').get('eventDateTimes') as FormArray
  }
  syncDateAcrossFields(index: number): void {
    const selectedDate = this.eventDateandTimeArr.at(index).get('eventDateView').value;
    this.eventDateandTimeArr.controls.forEach((control, idx) => {
      if (idx !== index) {
        control.get('eventDateView').setValue(selectedDate);
      }
    });
  }
  converteventDateandTimeFieldFormat() {
    this.eventDateTimeArr.controls.forEach((e, i) => {
      e.get('eventDate').setValue(e.get('eventDateView').value);
      e.get('eventFromTime').setValue(this.convertTimeFormat(e.get('eventFromTimeView').value));
      e.get('eventToTime').setValue(this.convertTimeFormat(e.get('eventToTimeView').value));
    });
  }
  convertTimeFormat(timeString: string) {
    const parts = timeString.split(':');
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  get eventDateTimeArrInvalid() {
    const elementWithOverlap = this.eventDateandTimeArr.controls.some(item => item.get('isTimeSlotOverlap').value === true);
    return elementWithOverlap;
  }

  isSameFromToTimeValidation() {
    this.eventDateandTimeArr.controls.forEach((e, i) => {
      if (e.get('eventFromTimeView').value == e.get('eventToTimeView').value) {
        e.get('isFromToSameTime').setValue(true);
      } else {
        e.get('isFromToSameTime').setValue(false);
      }
    });
  }
  checkIfAnyTimeIsInvalid(): boolean {
    const eventDateTimesArray = this.eventDateandTimeArr;
    for (let i = 0; i < eventDateTimesArray.length; i++) {
      const formGroup = eventDateTimesArray.at(i) as FormGroup;
      if (formGroup.get('isFromToSameTime')?.value) {
        return true;  // Return true as soon as you find a true value
      }
    }
    return false;  // Return false if no true values are found
  }
  onSubmit() {

    this.eventDateTimeArr.controls.forEach((d, i) => {
      const eventDateView = d.get('eventDateView')?.value;
      const eventFromTimeView = d.get('eventFromTimeView')?.value;
      const eventToTimeView = d.get('eventToTimeView')?.value;
      d.patchValue({
        eventDate: eventDateView,
        eventFromTime: eventFromTimeView,
        eventToTime: eventToTimeView
      });

    });
    this.isSameFromToTimeValidation();
    this.eventForm.markAllAsTouched();

    let hasOnlySpaces = false;
    let emptyvalue = false;

    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);



      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          const nestedControl = control.get(nestedKey);
          if (nestedControl.validator && nestedControl.errors) {
            if (nestedControl.errors['required']) {
              emptyvalue = true;
            }
            if (control.value == ' ' || control.value == " ") {
              hasOnlySpaces = true;
            }
          }
        });
      } else {
        if (control.validator && control.errors) {
          if (control.errors['required']) {
            emptyvalue = true;
          }
        }
      }
    });

    if (emptyvalue) {
      this.notify.error("Please fill out all required fields.");
      this.submit = false;
      return;
    }

    if (hasOnlySpaces) {
      this.notify.error("Spaces are not allowed");
      return;
    }
    const isAnyTimeInvalid = this.checkIfAnyTimeIsInvalid();
    if (isAnyTimeInvalid) {
      this.notify.error('Same event from and to time exisist');
      return;
    }
    if (this.eventForm.invalid || this.eventDateTimeArrInvalid) {
      this.notify.error(this.invalidFieldErrMsg);
      this.submit = false;
      return;
    }

    const eventFormEventImgValue = this.eventForm.get('eventImg')?.value;

    if (eventFormEventImgValue == null) {
      this.notify.error("Image not uploaded");
      return;
    }

    const source = document.getElementById("previewContent");
    if (source?.innerHTML == undefined || !source?.innerHTML) {
      this.notify.warning("Confirm Full Description");
      return;
    }

    this.eventForm.get('domFullContent').setValue(source?.innerHTML);
    const formValue = this.eventForm.getRawValue();
    formValue.status = formValue.status ? 'true' : 'false';
    this.submit = true;

    const createEvent = this._eventSeminorService.createEvent(this.eventForm.value)
      .pipe(finalize(() => {
        this.submit = false;
      }))
      .subscribe(response => {
        this.submit = false;
        if (response?.statusCode === 200) {
          this.webSocketService.sendEventPublish("LOAD_EVENTS");
          this.notify.success(response?.responseMessage);
          this.disableForm();
          this.navigateToEvents();
        } else {
          this.notify.error(response?.responseMessage);
        }
      });

    this.subscriptions.push(createEvent);
  }


  eventStartTime() {
    return this.eventForm.get('eventDetails.eventFromDateTime').value;
  }
  eventEndTime() {
    return this.eventForm.get('eventDetails.eventToDateTime').value;
  }

  convertTimeToDateTime(eventTime: string, fromDate?: Date): string {
    let currentDate = fromDate || new Date();
    const [hours, minutes] = eventTime.split(':');
    currentDate.setHours(Number(hours), Number(minutes));
    return moment(currentDate).format('YYYY-MM-DD HH:mm:ss');
  }


  convertDateTimeToTime(dateTime: any) {
    return moment(dateTime).format("HH:mm");
  }


  seteventNameToFg(eventName: string) {
    this.eventForm.get('eventName').setValue(eventName);
  }
  seteventDescToFg() {
    this.eventForm.get('eventDesc').setValue(this.eventForm.get('eventDetails').get('eventFormEventDesc').value);
  }
  seteventShortDescToFg(eventShortDesc: string) {
    this.eventForm.get('eventShortDesc').setValue(eventShortDesc);
  }
  setisPublishedToFg(isPublished: boolean) {
    this.eventForm.get('isPublished').setValue(isPublished);
  }

  isInputFieldView() {
    return !this.isView;
  }

  isValidInput(controlName: string) {
    const control = this.eventForm.get(controlName);
    return control && control.invalid && (control.dirty || control.touched);
  }


  eventFormField(formControlName: string) {
    return this.eventForm.get('eventDetails').get(formControlName);
  }
  isInavalidCoverImg(formControlName: string): boolean {
    return this.eventForm.get(formControlName)?.invalid &&
      (this.eventForm.get(formControlName)?.dirty ||
        this.eventForm.get(formControlName)?.touched);
  }
  isInValidField(formControlName: string): boolean {
    return this.eventFormField(formControlName)?.invalid && (this.eventFormField(formControlName)?.dirty ||
      this.eventFormField(formControlName)?.touched);
  }
  eventDateTimesArrField(index: number, formControlName: string) {
    return this.eventDateandTimeArr.at(index).get(formControlName);
  }
  isInValidEventDateTimesArrField(index: number, formControlName: string): boolean {
    return this.eventDateTimesArrField(index, formControlName).invalid &&
      (this.eventDateTimesArrField(index, formControlName).dirty ||
        this.eventDateTimesArrField(index, formControlName).touched);
  }


  companyNameSet() {
    this.eventForm.get('inquiries.0.companyName').setValue(this.eventFormField('eventFromCompanyName')?.value);
  }


  departmentNameSet() {
    this.eventForm.get('inquiries.0.departmentName').setValue(this.eventFormField('eventFromDepartmentName')?.value);
  }


  phoneNoSet() {
    this.eventForm.get('inquiries.0.telephoneNumber').setValue(this.eventFormField('eventFromTelephoneNumber')?.value);
  }



  emailSet() {
    this.eventForm.get('inquiries.0.emailAddress').setValue(this.eventFormField('eventFromEmailAddress')?.value);
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


  fileChangeEventForPresenter(event: any): void {
    const file = event.target.files[0];
    const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (file && acceptedFileTypes.includes(file.type)) {
      this.imageChangedEvent = event;
      this.modalService.open(this.cropperModalForPresenter);
    } else {
      this.toastr.error('Please select a PNG, JPG, or JPEG image.');
    }
  }


  confirmCrop(modal: any, formControlName: string): void {
    this.coverImg = this.croppedImage;
    this.eventForm.get(formControlName)?.setValue(this.croppedImage);
    this.eventForm.get('eventImg')?.setValue(this.croppedImage);
    this.resetFileInput();
    modal.close();

  }
  confirmCrop2(modal: any, formControlName: string): void {
    this.coverImg = this.croppedImage;
    this.eventForm.get(formControlName)?.setValue(this.croppedImage);
    this.eventForm.get('eventDetails.presenterDetails.presenterImage')?.setValue(this.croppedImage);
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


}
