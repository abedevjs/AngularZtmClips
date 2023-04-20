//* main.ts file is the main entry file of our app. It's the first file that runs when we load our app in the browser

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'

if (environment.production) {
  enableProdMode();
}

firebase.initializeApp(environment.firebase);

let appInIt = false;

firebase.auth().onAuthStateChanged(() => {
  if(!appInIt) {
    platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
  }
  
  appInIt = true;
})



