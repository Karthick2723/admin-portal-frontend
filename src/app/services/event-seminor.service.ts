import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventSeminorService {
  private prodapiURL = API_GATEWAY.SERVER + "/events";
  private prodapiEventTypeUrl=API_GATEWAY.SERVER +"/eventType";
  private serviceUrl: string;

  constructor(private httpClient: HttpService) { }

  getAllEvents(): Observable<any>{
    this.serviceUrl=this.prodapiURL+"/getAllEvents";
    return this.httpClient.getAll(this.serviceUrl);
  }

  createEvent(data:any): Observable<any>{
    this.serviceUrl=this.prodapiURL+"/createEvent";
    return this.httpClient.post(this.serviceUrl,data);
  }

  getEvent(id:number): Observable<any>{
    this.serviceUrl=this.prodapiURL+"/getEventById";
    return this.httpClient.getSingle(this.serviceUrl,id)
  }

  updateEvent(id:number,data:any): Observable<any>{
    this.serviceUrl=this.prodapiURL+"/editEventById";
    return this.httpClient.update(this.serviceUrl,id,data);

  }

  getAllEventsType(): Observable<any>{
    this.serviceUrl=this.prodapiEventTypeUrl+"/getAllEventTypes";
    return this.httpClient.getAll(this.serviceUrl);
  }

  deleteEvent(id:any){
    this.serviceUrl=this.prodapiURL+"/deleteEventById";
    return this.httpClient.delete(this.serviceUrl,id);
  }
}
