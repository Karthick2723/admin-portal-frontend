import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from 'src/app/services/client.service';
import { ClientDivisionFormState, InputValidationConstants } from 'src/assets/constants/validaton-text-constants';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-client-branch',
  templateUrl: './add-client-branch.component.html',
  styleUrls: ['./add-client-branch.component.scss']
})
export class AddClientBranchComponent implements OnInit, OnDestroy {

  clientDivisionForm: FormGroup;
  clientId: number;
  clientDivisionId: any;
  clientDivsionAction: string;
  popupData: any;
  isAddPage: boolean = false;
  isEditPage: boolean = false;
  isUpdatePage: boolean = false;
  submitLoader: boolean = false;
  updateLoader: boolean = false;
  formSubmitted = false;
  formUpdated = false;
  clientDivisionFormState: ClientDivisionFormState = {
    isFormUpdate: false,
    clientId: 0
  };

  invalidFieldsPopupMsg: string = "Please enter the mandatory fields.";
  submitMsg: string = "Client Division Creation Successfully";
  updateMsg: string = "Client Division Updated Successfully";
  submitFailureMsg: string = "Client Division Creation Failed";
  updateFailureMsg: string = "Client Division Updated Failed";
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
  formSubmissionFailedMsg = InputValidationConstants.formSubmissionFailedMsg;
  formUpdationFailedMsg = InputValidationConstants.formUpdationFailedMsg;

  private subscriptions: Subscription[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _clientService: ClientService,
    private notify: ToastrService,
    public dialogRef: MatDialogRef<AddClientBranchComponent>,
    private _commonService: CommonService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.popupData = data;
    this.clientId = parseInt(data?.clientId);
    this.clientDivisionId = parseInt(data?.clientDivisionId);
    this.clientDivsionAction = data?.action
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  closePopUp() {
    this.dialogRef.close(true);
  }

  isFormSubmit(newState: ClientDivisionFormState) {
    this._commonService.setClientDivisionState(newState);
  }
  ngOnInit(): void {
    this.initForm();
    this.getParams();

  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.clientDivisionForm.get(fieldName);
    return control && control.invalid && (control.dirty || control.touched);
  }


  initForm() {
    this.clientDivisionForm = this.fb.group({
      clientDivisionId: [0],
      divisionName: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(250)]],
      address: ['', [Validators.required, Validators.maxLength(150)]],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', [Validators.required, Validators.maxLength(50)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      status: [false],
      client: this.fb.group({
        clientId: [this.clientId]
      }),
      clientId: [0],
    });
  }


  disableForm() {
    this.clientDivisionForm.disable();
  }
  enableForm() {
    this.clientDivisionForm.enable();
  }

  getParams() {
    if (this.popupData) {
      if (this.clientDivsionAction == 'create') {
        this.isAddPage = true;
        this.isEditPage = false;
        this.isUpdatePage = false;
      }
      if (this.clientDivsionAction == 'Edit') {
        this.isAddPage = false;
        this.isEditPage = true;
        this.isUpdatePage = false;
        this.fetchAndPatchData(this.clientDivisionId);
        this.disableForm();
      }
      if (this.clientDivsionAction == 'Update') {
        this.isAddPage = false;
        this.isEditPage = false;
        this.isUpdatePage = true;
        this.fetchAndPatchData(this.clientDivisionId);

      }
    }
  }
  fetchAndPatchData(id: number) {
    const clientDivision = this._clientService.getClientDivision(id)
      .subscribe((response) => {
        if (response) {
          this.clientDivisionForm.patchValue({
            clientDivisionId: response?.clientDivisionId,
            divisionName: response?.divisionName,
            description: response?.description,
            address: response?.address,
            city: response?.city,
            country: response?.country,
            contactPerson: response?.contactPerson,
            phoneNumber: response?.phoneNumber,
            emailId: response?.emailId,
            status: response?.status === 'true',
            clientId: response?.clientId,
          });
        }
      });
    this.subscriptions.push(clientDivision);
  }
  editToUpdatePage() {
    this.isAddPage = false;
    this.isEditPage = false;
    this.isUpdatePage = true;
    this.enableForm();
  }
  clientFormField(formName: string) {
    return this.clientDivisionForm.get(formName)!;
  }

  setisPublishedToFg(isPublished: boolean) {
    this.clientDivisionForm.get('status').setValue(isPublished);
  }

  onSubmit() {

    if (this.clientDivisionForm.invalid) {
      this.clientDivisionForm.markAllAsTouched();
      this.notify.error("Please enter the mandatory fields.");
      return;
    }
    this.submitLoader = true;

    const clientDivCreate = this._clientService.createClientDivision(this.clientDivisionForm.value)
      .subscribe((response) => {
        this.submitLoader = false;

        const statusCode = response?.statusCode;
        let isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 202;
        if (isSuccess) {
          this.notify.success(this.submitMsg);
          this.formSubmitted = true;
          this.disableForm();
          this.clientDivisionFormState.clientId = response?.client?.clientId;
          this.clientDivisionFormState.isFormUpdate = true
          this.isFormSubmit(this.clientDivisionFormState);
          this.closePopUp();
        } else {
          this.toastr.error(response.responseMessage);
        }
      });

    this.subscriptions.push(clientDivCreate);
  }

  update(id: any) {

    if (this.clientDivisionForm.invalid) {
      this.clientDivisionForm.markAllAsTouched();
      this.notify.error("Please enter the mandatory fields.");
      return;
    }
    this.updateLoader = true;
    const clientDivUpdate = this._clientService.updateClientDivision(id, this.clientDivisionForm.value)
      .subscribe((response) => {
        this.updateLoader = false;

        const statusCode = response?.statusCode;
        let isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 202;
        if (isSuccess) {
          this.updateLoader = false;
          this.notify.success(this.updateMsg);
          this.clientDivisionForm.disable();
          this.formUpdated = true;
          this.disableForm();
          this.clientDivisionFormState.clientId = response?.client?.clientId;
          this.clientDivisionFormState.isFormUpdate = true
          this.isFormSubmit(this.clientDivisionFormState);
          this.closePopUp();
        } else {
          this.toastr.error(response.responseMessage);
        }
      });

    this.subscriptions.push(clientDivUpdate);
  }

}
export enum ModalType {
  INFO = 'info',
  WARN = 'warn'
}