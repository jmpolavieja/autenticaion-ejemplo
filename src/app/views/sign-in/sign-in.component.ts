import { Component, Optional } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  
  constructor(
    private authService: AuthService
  ){}

  logIn(email: string, password: string) {
    this.authService.SignIn(email,password);
  }

  logInWithGoogle() {
    this.authService.logInWithGoogleProvideer();
  }
}


