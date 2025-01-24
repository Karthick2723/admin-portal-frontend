import { Injectable } from '@angular/core';
import { API_GATEWAY } from 'src/environments/environment';
import { HttpService } from './http-services';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private prodapiURL = API_GATEWAY.SERVER + "/clients";
  private prodapiClientDivUrl = API_GATEWAY.SERVER + "/clientDivisionDetails";
  private serviceUrl: string;

  constructor(private httpClient: HttpService) { }

  createClient(data: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/createClient";
    return this.httpClient.post(this.serviceUrl, data);
  }

  getAllClient(): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/allClients";
    return this.httpClient.getAll(this.serviceUrl);
  }

  getClient(id: number): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/getClientById";
    return this.httpClient.getSingle(this.serviceUrl, id)
  }

  updateClient(id: number, data: any): Observable<any> {
    this.serviceUrl = this.prodapiURL + "/editClientById";
    return this.httpClient.update(this.serviceUrl, id, data);

  }

  getAllClientDivision(): Observable<any> {
    this.serviceUrl = this.prodapiClientDivUrl + "/getAllClientDivisions";
    return this.httpClient.getAll(this.serviceUrl);
  }

  createClientDivision(data: any): Observable<any> {
    this.serviceUrl = this.prodapiClientDivUrl + "/createDivision";
    return this.httpClient.post(this.serviceUrl, data);
  }

  getClientDivision(id: number): Observable<any> {
    this.serviceUrl = this.prodapiClientDivUrl + "/getClientDivisionDetailsById";
    return this.httpClient.getSingle(this.serviceUrl, id);
  }

  updateClientDivision(id: number, data: any): Observable<any> {
    this.serviceUrl = this.prodapiClientDivUrl + "/editDivisionDetailsById";
    return this.httpClient.update(this.serviceUrl, id, data);

  }

  getClientBasedClientDiv(clientId: number) {
    this.serviceUrl = this.prodapiClientDivUrl + "/getClientDivisionDetailsByClientId";
    return this.httpClient.getSingle(this.serviceUrl, clientId)
  }
}
