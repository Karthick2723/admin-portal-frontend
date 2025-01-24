import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  public prodapiURL = API_GATEWAY.SERVER + "/banner";
  private serviceUrl: string;
  public fullBannerSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private httpClient: HttpService) { }

  getAllBanner(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getAllBanners";
    return this.httpClient.getByurl(this.serviceUrl);
  }

  getBannerById(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getBannerById";
    return this.httpClient.getSingle(this.serviceUrl, id);
  }

  createBanner(data: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/createBanner";
    return this.httpClient.post(this.serviceUrl, data);
  }

  updateBanner(id: number, data: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/editBanner";
    return this.httpClient.update(this.serviceUrl, id, data);
  }
}
