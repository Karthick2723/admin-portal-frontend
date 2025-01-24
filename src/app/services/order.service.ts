import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  public prodapiURL = API_GATEWAY.SERVER + "/orders";
  public clientURL = API_GATEWAY.SERVER + "/clients";
  public vendorURL = API_GATEWAY.SERVER + "/vendor";
  private serviceUrl: string;
  public orderlistSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  public orderResponseSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private httpClient: HttpService) { }



  getallOrderList(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getOrderList";
    return this.httpClient.getByurl(this.serviceUrl);
  }

  publishUpdate(id: any, object: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/updatePublishedStatus";
    return this.httpClient.updatedata(this.serviceUrl, object, id);
  }


  getSampleDataUrl() {
    this.serviceUrl = this.prodapiURL + "/getTemplateURL";
    return this.httpClient.getAll(this.serviceUrl);
  }

  deleteOrder(id: any) {
    this.serviceUrl = this.prodapiURL;
    return this.httpClient.delete(this.serviceUrl, id)
  }

  editOrders(item: any, id: any): Observable<any> {
    this.serviceUrl = this.prodapiURL;
    return this.httpClient.updatedata(this.serviceUrl, item, id)
  }

  getAllClients(): Observable<any> {
    this.serviceUrl = this.clientURL + "/clientNamesInOrderList";
    return this.httpClient.getAll(this.serviceUrl);
  }


  importExcell(importExcel: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + '/importExcel';
    return this.httpClient.post(this.serviceUrl, importExcel);
  }

  getAllVendors(): Observable<any> {
    this.serviceUrl = this.vendorURL + '/getAllVendor';
    return this.httpClient.getAll(this.serviceUrl);
  }
}
