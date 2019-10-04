import { CanDeactivate } from '@angular/router';
import { Tb100Component } from '../components/diary/tb100.component';

export class Tb100DeactivateGuard implements CanDeactivate<Tb100Component> {

  canDeactivate(target: Tb100Component) {
    //if(target.hasChanges()){
    //    return window.confirm('Do you really want to cancel?');
    //}
    return true;
  }
}
