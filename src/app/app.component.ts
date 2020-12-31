import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from './app.state';
import { Observable } from 'rxjs';
import * as GlobalActions from './actions/global.actions'
import { SwPush, SwUpdate } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { CheckForUpdateService } from './services';


@Component({
  selector: 'app-root',
  template: `
<div class="container">
  <!--button class="button button-primary" (click)="subscribeToNotifications()">Abonnieren</button-->
  <button class="button button-primary" (click)="notifyMe()">Benachrichtigung</button>
  <app-menu></app-menu>
  <div *ngIf="globalError$ | async as globalError">
    <ngb-alert type="danger" (close)="clearErrorGlobal()">{{ globalError }}</ngb-alert>
  </div>
  <router-outlet></router-outlet>
</div>
  `,
  styles: [``]
})
export class AppComponent implements OnInit {
  title: string = 'JSHH';
  globalError$: Observable<string>;
  readonly VAPID_PUBLIC_KEY = "BDdqW4UCMfv2JBGzsECU3pBUaCuR_qe0QHeJNV2EKxfGZXQ7ufIEqNX5TL5jdhbYdmdWV0Iti0-uaqr-JDj2jYQ";
  private baseUrl = 'https://jshh.cwkuehl.de/notifications';
  updateAvailable = false;

  constructor(private store: Store<AppState>, @Inject(LOCALE_ID) locale: string,
    private swUpdate: SwUpdate, private swPush: SwPush, private http: HttpClient,
    private checkForUpdateService: CheckForUpdateService) {
    this.globalError$ = store.pipe(select('globalError'));
    console.log('locale: ' + locale);
    this.swPush.notificationClicks.subscribe(event => {
      console.log('Received notification: ', event);
      const url = event.notification.data.url;
      window.open(url, '_self'); // _blank
      // document.location;
    });
    this.swUpdate.available.subscribe((event) => {
      console.log('Update available: ', event);
      this.updateAvailable = true;
      if (confirm("Soll die neue Version geladen werden?")) {
        window.location.reload();
      }
    });
  }

  ngOnInit() {
    // if (this.swUpdate.isEnabled) {
    //   this.swUpdate.available.subscribe(() => {
    //     if (confirm("Soll die neue Version geladen werden?")) {
    //       window.location.reload();
    //     }
    //   });
    // }
    // this.subscribeToNotifications();
  }

  clearErrorGlobal() {
    this.store.dispatch(GlobalActions.ClearError());
  }

  subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => this.sendToServer(sub)) // this.newsletterService.addPushSubscriber(sub).subscribe())
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

  sendToServer(params: PushSubscription) {
    console.log('Subscription received: ', params);
    // this.showNotification();
    // this.notifyMe();
    // Push in Google Chrome F12 Service Worker:
    // this.http.post(this.baseUrl, { notification: params }).subscribe();
    // {"notification":{"title":"Benachrichtigung","body":"Medikamente nehmen!","icon":"https://jshh.cwkuehl.de/assets/icons/icon-512x512.png","vibrate":[100,50,100],"data":{"url":"https://jshh.cwkuehl.de/#/memos"}}}
  }

  // showNotification() {
  //   Notification.requestPermission(function (result) {
  //     if (result === 'granted') {
  //       navigator.serviceWorker.ready.then(function (registration) {
  //         registration.showNotification('Vibration Sample', {
  //           body: 'Buzz! Buzz!',
  //           icon: '../images/touch/chrome-touch-icon-192x192.png',
  //           vibrate: [200, 100, 200, 100, 200, 100, 200],
  //           tag: 'vibration-sample'
  //         });
  //       });
  //     }
  //   });
  // }

  notifyMe() {
    //alert("notify start");
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (window.Notification.permission === "granted") {
      //alert("notify granted");
      // If it's okay let's create a notification
      this.spawnNotification("Hi there, granted!");
      return;
    }
    else if (window.Notification.permission !== "denied") {
      //alert("notify !== denied");
      window.Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          this.spawnNotification("Hi there, granted 2!");
        }
      });
    }
    //alert("notify end");
    this.spawnNotification("Hi there, ungranted!");
  }

  spawnNotification(title: string, body: string = null) {
    var url = window.location.protocol + '//' + window.location.hostname + '/#/memos';
    body = (body || title) + ' ' + url;
    var options = {
      body: body,
      icon: "https://jshh.cwkuehl.de/assets/icons/icon-72x72.png",
      data: { url: url },
    }
    var n = new Notification(title, options);
    n.onclick = function () {
      alert("Notification clicked: " + n.data.url);
    };
    // setTimeout(function () {
    //   var n = new Notification(title + " time", options);
    // }, 10);
  }
}
