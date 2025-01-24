import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Updated import

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent {
  adminSignInRequest = { emailId: '', password: '' };
  isSubmitting = false;
  password;
  show = false;
  errorMessage: string = '';
  authmail: string;
  authPassword: string;

  constructor(private authService: AuthService, private router: Router, private afAuth: AngularFireAuth) { }

  ngOnInit() {
    if (this.authService.isAuthorized()) {
      this.router.navigate(['/dashboard'])

    }
  }

  loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        if (result.user) {
          result.user.getIdToken(true).then((token) => {
            localStorage.setItem('firebaseToken', token); // Store the token
          });
        }
      })
      .catch((error) => {
        console.error('Google sign-in error:', error.message);
      });
  }

  authLogin() {
    this.isSubmitting = true;
    this.errorMessage = '';
    if (this.authmail == '' || this.authPassword == '') {
    } else {
      this.authService.authLogin(this.authmail, this.authPassword)
      this.router.navigate(['/dashboard']);
      this.isSubmitting = false;
    }
  }

  adminSignIn(LoginSignInForm: NgForm) {
    this.isSubmitting = true;
    this.errorMessage = '';

    if (LoginSignInForm.invalid) {
      return;
    }

    this.authService.adminSignin(this.adminSignInRequest).subscribe(
      (response: any) => {
        if (response.isAdmin && response.statusCode === 200) {
          this.authService.setAccessToken(response.token);
          localStorage.setItem('userId', response.userId);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
        this.isSubmitting = false;
      },
      (error: any) => {
        this.isSubmitting = false;
        //alert('Invalid credentials or you are not an Admin');
      }
    );
  }

  toggleShow() {
    if (this.password === 'password') {
      this.password = 'text';
      this.show = true;
    } else {
      this.password = 'password';
      this.show = false;
    }
  }
}
