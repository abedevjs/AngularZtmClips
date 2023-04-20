import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email], this.emailTaken.validate);
  age = new FormControl<number | null>(null, [Validators.required, Validators.min(18), Validators.max(100)]);
  password = new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)]);
  confirm_password = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('');

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber,
  }, [RegisterValidators.match('password', 'confirm_password')]);

  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.'
  alertColor = 'blue'

  async register() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.'
    this.alertColor = 'blue';

    // const {email, password} = this.registerForm.value;

    try {
      await this.auth.createUser(this.registerForm.value as IUser)
      
    } catch (error) {
      console.error(error);
      
      this.alertMsg = 'An error occurred, please try again later'
      this.alertColor = 'red';
      this.inSubmission = false;
      return
    }

    this.alertMsg = 'Successfully created a new account'
    this.alertColor = 'green'
  }


}
