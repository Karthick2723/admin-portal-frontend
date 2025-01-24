import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_GATEWAY } from 'src/environments/environment';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { ToastrService } from 'ngx-toastr';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;
  private timeout: any;
  private idleTime: number = 86400000;

  constructor(private http: HttpClient, private router: Router, private fireAuth: AngularFireAuth,
    private toastr: ToastrService) {
    this.apiUrl = API_GATEWAY.SERVER;
    this.ngOnInit();
    this.setupSessionClear();
    this.setupActivityTracking();
  }

  setupActivityTracking() {
    window.addEventListener('mousemove', this.updateLastActivityTime.bind(this));
    window.addEventListener('keydown', this.updateLastActivityTime.bind(this));
  }

  updateLastActivityTime() {
    sessionStorage.setItem('lastActivity', new Date().toISOString());
    this.resetTimeout();
  }

  checkSessionTimeout() {
    const lastActivity = sessionStorage.getItem('lastActivity');
    if (lastActivity) {
      const lastActivityTime = new Date(lastActivity).getTime();
      const currentTime = new Date().getTime();
      if (currentTime - lastActivityTime > this.idleTime) {
        this.handleTimeout();
      } else {
        this.resetTimeout();
      }
    }
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.checkSessionTimeout();
  }
  setupSessionClear() {
    window.onbeforeunload = () => {
      // Clear session storage but keep local storage intact
      sessionStorage.clear();
    };
  }

  encryptPassword(password: string): string {
    const secretKey = 'your-secret-key';
    return CryptoJS.AES.encrypt(password, secretKey).toString();
  }


  ngOnDestroy(): void {
    this.clearTimeout();
    this.removeMouseListeners();
  }


  checkLoginStatus() {
    const isLoggedIn = !!localStorage.getItem('token');
    if (isLoggedIn) {
      this.setupMouseListeners();
      this.resetTimeout();
    } else {
      this.removeMouseListeners();
    }
  }

  onMouseMove() {
    this.resetTimeout();
  }

  resetTimeout() {
    this.clearTimeout();
    this.timeout = setTimeout(() => this.checkSessionTimeout(), this.idleTime);
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  handleTimeout() {
    sessionStorage.clear(); // Clear session storage
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
    localStorage.removeItem('userId');
    localStorage.removeItem('idToken');
    localStorage.removeItem(API_GATEWAY.ACCESS_TOKEN_KEY);
    this.fireLogOut();
  }

  setupMouseListeners() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  removeMouseListeners() {
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }

  //FireBaseLoginLogic
  authLogin(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password).then(
      (res) => {
        res.user?.getIdToken().then((idToken) => {
          localStorage.setItem('idToken', idToken); // Store the idToken in local storage
          const encryptedPassword = this.encryptPassword(password);
          const adminSignInRequest = { emailId: email, password: encryptedPassword, uuid: res.user.uid };

          this.http.post<any>(`${this.apiUrl}/admin/signin`, adminSignInRequest).subscribe((response) => {
            if (response.isAdmin && response.statusCode === 200) {
              this.setAccessToken(response.token);
              localStorage.setItem('userId', response.userId);
              this.router.navigate(['/dashboard']);
              localStorage.setItem('email', response.emailId);
              localStorage.setItem('userId', response.userId);
              localStorage.setItem('token', 'true'); // Store a flag indicating successful login
              this.toastr.success('Login Successful');
            }
            else {
              this.toastr.error(response.message || 'Login failed');
            }
          });
        });
      },
      (authError) => {
        const errorMessage = this.extractFirebaseErrorMessage(authError);
        this.toastr.error(errorMessage);
      }
    );
  }

  authRegister(email: string, password: string) {
    this.fireAuth.createUserWithEmailAndPassword(email, password).then(() => {
      alert('Registration Successfully')
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
      this.router.navigate(['/register']);
    }
    )
  }

  fireLogOut() {
    this.fireAuth.signOut().then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('email')
      localStorage.removeItem('userId');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message)
    }
    )
    localStorage.removeItem(API_GATEWAY.ACCESS_TOKEN_KEY);
  }

  adminSignin(adminSignInRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/signin`, adminSignInRequest)
  }
  setAccessToken(token: any): void {
    localStorage.setItem(API_GATEWAY.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(API_GATEWAY.ACCESS_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  isAuthorized(): Observable<boolean> {
    const isAuthorized = !!localStorage.getItem(API_GATEWAY.ACCESS_TOKEN_KEY);
    return new Observable<boolean>((observer) => {
      observer.next(isAuthorized);
      observer.complete();
    });
  }

  public logOut(msg?: string) {
    sessionStorage.clear(); // Ensure session storage is cleared
    localStorage.removeItem(API_GATEWAY.ACCESS_TOKEN_KEY);
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('idToken');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
    this.toastr.success('LogOut Successful');
  }

  private extractFirebaseErrorMessage(error: any): string {
    if (error && error.message) {
      const messageMatch = error.message.match(/Firebase: (.+) \(auth\/.+\)/);
      return messageMatch ? messageMatch[1] : 'An unknown error occurred.';
    }
    return 'An unknown error occurred.';
  }

  refreshToken(): Observable<string> {
    return from(this.fireAuth.currentUser).pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken(true)); // Force refresh the token
        } else {
          return throwError('No user logged in');
        }
      })
    );
  }

}
