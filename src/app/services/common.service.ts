import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ClientDivisionFormState } from 'src/assets/constants/validaton-text-constants';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private selectedLinkSubject = new BehaviorSubject<string>('Orders');
  selectedLink$ = this.selectedLinkSubject.asObservable();

  private customEditorImgDataSubject = new BehaviorSubject<any>(null);
  editorImgData = this.customEditorImgDataSubject.asObservable();


  private clientDivisionFormStateSubject = new BehaviorSubject<ClientDivisionFormState>({
    isFormUpdate: false,
    clientId: 0
  });

  constructor() { }

  setImgDataForEditor(data: any): void {
    this.customEditorImgDataSubject.next(data);
  }

  setSelectedLink(link: string) {
    this.selectedLinkSubject.next(link);
  }

  getClientDivisionState(): Observable<ClientDivisionFormState> {
    return this.clientDivisionFormStateSubject.asObservable();
  }

  setClientDivisionState(newState: ClientDivisionFormState): void {
    this.clientDivisionFormStateSubject.next(newState);
  }
}
