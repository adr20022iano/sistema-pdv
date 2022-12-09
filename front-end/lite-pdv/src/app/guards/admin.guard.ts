import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../modules/core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(): boolean {

    if (!this.authService.isAdmin()) {
      this.router.navigate(['vendas']).then();
      return false;
    }

    return true;

  }

}
