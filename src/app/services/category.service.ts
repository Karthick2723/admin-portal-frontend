import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  public prodapiURL = API_GATEWAY.SERVER + "/category";
  private serviceUrl: string;
  public fullCategorySubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private httpClient: HttpService) { }

  getallcategory(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getAllCategory";
    return this.httpClient.getByurl(this.serviceUrl);
  }

  getCategoryById(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getCategory";
    return this.httpClient.getSingle(this.serviceUrl, id);
  }
  addProduct(item): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/createCategory";
    return this.httpClient.post(this.serviceUrl, item);
  }
  updateall(item, id): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/editCategory";
    return this.httpClient.updatedata(this.serviceUrl, item, id);
  }
  getFullCategoryById(categoryId: number): Observable<any> {
    return this.httpClient.getAllbyid(`${this.prodapiURL}/getVendorProductLOBByCategoryId/${categoryId}`);
  }
}
