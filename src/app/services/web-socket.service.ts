import { Injectable } from '@angular/core';
import * as Stomp from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { API_GATEWAY } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Stomp.Client;
  private messageSubject: Subject<string> = new Subject<string>();
  public messages$ = this.messageSubject.asObservable();
  private isConnected = false;
  public webSocketURL = API_GATEWAY.WEBSOCKET_SERVER;
  constructor() {
    this.connect();
  }

  connect() {
    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.Stomp.over(socket);
    this.stompClient.debug = () => { };
    this.stompClient.onConnect = (frame) => {
      this.isConnected = true;
      this.stompClient.subscribe('/topic/messagesProduct', (message) => {
        this.messageSubject.next(message.body);
      });
    };
    this.stompClient.onStompError = (frame) => {

    };

    this.stompClient.onWebSocketClose = (evt) => {
      this.isConnected = false;
      setTimeout(() => {
        this.connect();
      }, 5000);
    };

    this.stompClient.onWebSocketError = (error) => {
    };

    this.stompClient.activate();
  }

  sendProduct(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendProduct', body: message });
    }
  }

  sendCategory(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendCategory', body: message });
    }
  }

  sendEvent(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendEvent', body: message });
    }
  }

  sendUser(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendUser', body: message });
    }
  }

  sendProductPublish(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendProduct', body: message });
    }
  }

  sendEventPublish(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendEvent', body: message });
    }
  }

  sendUserEmailChange(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendUser', body: message });
    }
  }

  sendArticle(message: string) {
    if (this.isConnected) {
      this.stompClient.publish({ destination: '/app/sendArticle', body: message });
    } 
  }
}
