import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  public prodapiURL = API_GATEWAY.SERVER + "/products";
  public producttagapiURL = API_GATEWAY.SERVER + "/productTags";
  public vendorapiURL = API_GATEWAY.SERVER + "/vendor";
  private serviceUrl: string;
  constructor(private httpClient: HttpService) { }

  getallproduct(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getAll";
    return this.httpClient.getByurl(this.serviceUrl);
  }
  getallvendor(): Observable<any> {
    this.serviceUrl = this.vendorapiURL + "/getAllVendor";
    return this.httpClient.getByurl(this.serviceUrl);
  }
  addProduct(item): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/create";
    return this.httpClient.post(this.serviceUrl, item);
  }
  getCategoryById(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getProductById";
    return this.httpClient.getSingle(this.serviceUrl, id);
  }
  updateall(item: any, id: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/editProductById";
    return this.httpClient.updatedata(this.serviceUrl, item, id);
  }

  getAllProductTags(): Observable<any> {
    this.serviceUrl = this.producttagapiURL + "/getAllProductTags";
    return this.httpClient.getByurl(this.serviceUrl)
  }
}

