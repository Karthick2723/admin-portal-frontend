import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManageentService {

  public prodapiURL = API_GATEWAY.SERVER;
  private serviceUrl: string;
  constructor(private httpClient: HttpService) { }

  getallUserDetails(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getUsers";
    return this.httpClient.getByurl(this.serviceUrl);
  }

  getUserDetailsById(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getUsers";
    return this.httpClient.getSingle(this.serviceUrl, id);
  }
  addUsers(item): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/signup";
    return this.httpClient.post(this.serviceUrl, item);
  }

  updateUser(item, id): Observable<any> {
    this.serviceUrl = this.prodapiURL + '/updateUsers';
    return this.httpClient.updatedata(this.serviceUrl, item, id);
  }

}
