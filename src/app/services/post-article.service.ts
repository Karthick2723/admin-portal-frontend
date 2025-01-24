import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostArticleService {


  private prodapiURL = API_GATEWAY.SERVER + "/articles";
  private typeURL = API_GATEWAY.SERVER + "/articleType";
  private tagURL = API_GATEWAY.SERVER + "/articleTags";
  private serviceUrl: string;
  private authToken: string | null = null; // Initialize the authToken

  constructor(private httpClient: HttpService) {
    this.authToken = localStorage.getItem('firebaseAuthToken'); // Example storage retrieval

  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('firebaseAuthToken', token); // Store the token for future use
  }

  getAllArticle(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getAllArticles";
    return this.httpClient.getAll(this.serviceUrl);
  }

  createArticle(data: any): Observable<any> {
    const serviceUrl = `${this.prodapiURL}/createArticle`;
    return this.httpClient.post<any>(serviceUrl, data);
  }
  
  getArticleById(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getArticleById";
    return this.httpClient.getSingle(this.serviceUrl, id)
  }

  updateArticle(id: number, data: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/editArticleById";
    return this.httpClient.update(this.serviceUrl, id, data);
  }

  getAllArticleType(): Observable<any> {
    this.serviceUrl = this.typeURL + "/getAllArticleTypes";
    return this.httpClient.getAll(this.serviceUrl);
  }

  getAllArticleTags(): Observable<any> {
    this.serviceUrl = this.tagURL + "/getAllArticleTags";
    return this.httpClient.getAll(this.serviceUrl);
  }
}
