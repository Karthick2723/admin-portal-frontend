import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LineOfbussinessService {


  public prodapiURL = API_GATEWAY.SERVER + "/lob";
  private serviceUrl: string;
  constructor(private httpClient: HttpService) { }

  getallLob(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getAll";
    return this.httpClient.getByurl(this.serviceUrl);
  }

  getLobById(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL;
    return this.httpClient.getSingle(this.serviceUrl, id);
  }
  addLob(item): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/save";
    return this.httpClient.post(this.serviceUrl, item);
  }

  updateall(item, id): Observable<any> {
    this.serviceUrl = this.prodapiURL;
    return this.httpClient.updatedata(this.serviceUrl, item, id);
  }

}
