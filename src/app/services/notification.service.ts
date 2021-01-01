import { ApplicationRef, Injectable } from '@angular/core';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notsupported: boolean = false;
  count: number = 0;

  constructor(appRef: ApplicationRef) {
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const interval$ = interval(5000); //1 * 60 * 60 * 1000);
    const intervalStable$ = concat(appIsStable$, interval$);

    intervalStable$.subscribe(() => this.intervalNotification());
  }

  public resetCounter(c: number = 0) {
    this.count = c;
  }

  intervalNotification() {
    if (this.count < 0) {
      return;
    }
    this.count++;
    var title = 'intervalNotification ' + this.count;
    this.notify(title);
  }

  notify(title: string, body: string = null) {
    if (!("Notification" in window)) {
      if (!this.notsupported) {
        alert("This browser does not support desktop notification");
        this.notsupported = true;
      }
      return;
    }
    if (window.Notification.permission === "granted") {
      //alert("notify granted");
      // If it's okay let's create a notification
      this.spawnNotification(title, body);
      return;
    }
    if (window.Notification.permission !== "denied") {
      //alert("notify !== denied");
      window.Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          this.spawnNotification(title, body);
        }
      });
      this.spawnNotification("Hi there, ungranted!");
    }
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
