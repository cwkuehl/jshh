import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from './app.state';
import { Observable } from 'rxjs';
import * as GlobalActions from './actions/global.actions'
import { SwPush, SwUpdate } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  template: `
<div class="container">
  <!--button class="button button-primary" (click)="subscribeToNotifications()">Abonnieren</button-->
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
  push$: Observable<PushSubscription>;

  constructor(private store: Store<AppState>, @Inject(LOCALE_ID) locale: string,
    private swUpdate: SwUpdate, private swPush: SwPush, private http: HttpClient) {
    this.globalError$ = store.pipe(select('globalError'));
    console.log('locale: ' + locale);
    this.swPush.notificationClicks.subscribe(event => {
      console.log('Received notification: ', event);
      const url = event.notification.data.url;
      window.open(url, '_self'); // _blank
    });
  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("Soll die neue Version geladen werden?")) {
          window.location.reload();
        }
      });
    }
    this.subscribeToNotifications();
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

  sendToServer(params: any) {
    console.log('Subscription received: ', params);
    // Push in Google Chrome F12 Service Worker:
    this.http.post(this.baseUrl, { notification: params }).subscribe();
    // {"notification":{"title":"Benachrichtigung","body":"Medikamente nehmen!","icon":"https://jshh.cwkuehl.de/assets/icons/icon-512x512.png","vibrate":[100,50,100],"data":{"url":"https://jshh.cwkuehl.de/#/memos"}}}
  }
}
