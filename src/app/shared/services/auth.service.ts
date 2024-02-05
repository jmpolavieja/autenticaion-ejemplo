import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from './user';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, addDoc, doc, updateDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    private firestore: Firestore
  ) {
    /* Salvando los datos del usuario en localstorage cuando loged in y configurarl a nulo cuando logged out */
    this.afAuth.authState.subscribe(
      (user) => {
        if(user) {
          this.userData = user;
          localStorage.setItem('user', JSON.stringify(this.userData));
          //JSON.parse(localStorage.getItem('user')!);
        } else {
          localStorage.setItem('user', 'null');
          //JSON.parse(localStorage.getItem('user')!);
        }
      });
   }

   // Sign in with email/password (login)
  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.router.navigate(['dashboard']);
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  
  // Sign up with email/password (registro)
  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  logInWithGoogleProvideer(){
    return this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then(()=> this.observeUserState())
      .catch((error: Error) => {
        alert(error.message)
      })
  }

  observeUserState() {
    this.afAuth.authState.subscribe((userState) => {
      userState && this.ngZone.run(() => this.router.navigate(['dashboard']))
    })
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }
  
  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }
  
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const docRef = doc(this.firestore, `users/${user.uid}`);
    /* const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    ); */
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return updateDoc(docRef, userData);
    /* return userRef.set(userData, {
      merge: true,
    }); */
  }
  
  // Sign out (Fin de sesion)
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}
