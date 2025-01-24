import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, finalize } from 'rxjs';
import { ClientService } from 'src/app/services/client.service';
import { InputValidationConstants } from 'src/assets/constants/validaton-text-constants';

@Component({
  selector: 'app-add-clients',
  templateUrl: './add-clients.component.html',
  styleUrls: ['./add-clients.component.scss']
})
export class AddClientsComponent implements OnInit, OnDestroy {

  id: any;
  action: string;
  isView: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false;
  submit: boolean = false;
  update: boolean = false;
  formSubmitted = false;
  formUpdated = false;
  clientForm: FormGroup;
  invalidFieldsPopupMsg: string = "Please enter the mandatory fields.";
  submitMsg: string = "Client Created Successfully";
  updateMsg: string = "Client Updated Successfully";
  submitFailureMsg: string = "Client Creation Failed";
  updateFailureMsg: string = "Client Updated Failed";
  clientDivisionList: any[];
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

  private subscriptions: Subscription[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notify: ToastrService,
    private activatedRoute: ActivatedRoute,
    private _clientService: ClientService,
    private toastr: ToastrService
  ) { }


  ngOnInit(): void {
    this.initMethodS();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initMethodS() {
    this.initForm();
    this.getQueryParams();
  }
  navigateToClients() {
    this.router.navigate(['/clients']);
  }
  getQueryParams() {
    const queryParams = this.activatedRoute.queryParamMap.subscribe(res => {
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
    this.subscriptions.push(queryParams);
  }
  get isViewClienDiv(): boolean {
    const clientId = this.clientForm.get('clientId').value;
    return clientId !== 0 && clientId !== null;
  }
  navigateListPage() {
    this.router.navigate(['/clients']);
  }
  changeViewtoEdit() {
    this.isEdit = true;
    this.isView = false;
    this.enableForm();
  }

  fetchEventAndPatchData(id: number) {
    if (id) {
      const clientId = this._clientService.getClient(id)
        .subscribe((response) => {
          this.clientForm.patchValue({
            clientId: response?.clientId,
            clientName: response?.clientName,
            emailId: response?.emailId,
            phoneNumber: response?.phoneNumber,
            status: response?.status === 'true',
            description: response?.description,
            contactPerson: response?.contactPerson,
            address: response?.address,
            city: response?.city,
            country: response?.country,
          });
          this.clientDivisionList = response?.clientDivisionDetails;
        });

      this.subscriptions.push(clientId);
    }
  }
  onSubmit() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.notify.error(this.invalidFieldsPopupMsg);
      return;
    }
    this.submit = true;
    const createClient = this._clientService.createClient(this.clientForm.value)
      .subscribe((response) => {
        this.submit = false;
        const statusCode = response?.statusCode;
        let isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 202;
        if (isSuccess) {
          this.notify.success(this.submitMsg);
          this.formSubmitted = true;
          this.id = response?.clientId;
          this.clientForm.disable();
          this.fetchEventAndPatchData(parseInt(response?.clientId));
          this.clientForm.reset();
          this.router.navigate(['/clients'], { queryParams: { id: response.categoryId, action: 'edits' } });
          this.goBack();
          return;
        }
        this.toastr.error(response.responseMessage);
      });
    this.subscriptions.push(createClient)
  }
  onUpdate() {

    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.notify.error("Please enter the mandatory fields.");
      return;
    }
    this.update = true;
    const updateClient = this._clientService.updateClient(this.id, this.clientForm.value)
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
          this.id = response?.clientId;
          this.formUpdated = true;
          this.disableForm();
          this.notify.success(this.updateMsg);
          this.clientForm.reset();
          this.router.navigate(['/clients'], { queryParams: { id: response.categoryId, action: 'edits' } });
          this.goBack();
          return;
        }
        this.toastr.error(response.responseMessage);
      });

    this.subscriptions.push(updateClient);
  }

  initForm() {
    this.clientForm = this.fb.group({
      clientId: [0], 
      clientName: ['', [Validators.required, Validators.maxLength(50)]],
      emailId: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      status: [],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(50)]],
      address: ['', [Validators.required, Validators.maxLength(150)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', [Validators.required, Validators.maxLength(50)]],
      clientDivisionDetails: [],
      statusCode: [],
      responseMessage: ['']
    });
  }

  isInValidField(fieldName: string): boolean {
    const control = this.clientForm.get(fieldName);
    return control && control.invalid && (control.dirty || control.touched);
  }
  discard() {
    this.clientForm.reset();
    this.navigateListPage();
  }
  disableForm() {
    this.clientForm.disable();
  }
  enableForm() {
    this.clientForm.enable();
  }
  removeClientDivision(index: number) {
    const clientDivisions = this.clientForm.get('clientDivisionDetails') as FormArray;
    clientDivisions.removeAt(index);
  }

  clientFormField(formName: string) {
    return this.clientForm.get(formName)!;
  }

  setisPublishedToFg(isPublished: boolean) {
    this.clientForm.get('status').setValue(isPublished);
  }

  goBack() {
    window.history.back();
  }
}

