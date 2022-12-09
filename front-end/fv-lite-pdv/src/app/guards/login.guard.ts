import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {AuthService} from '../modules/core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(): boolean {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['login']).then();
      return false;
    }

    return true;

  }

}
