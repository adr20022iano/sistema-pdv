import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../modules/core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(): boolean {

    if (!this.authService.isAdmin() && !this.authService.getUserConfig()?.sellerSalesReport) {
      this.router.navigate(['vendas']).then();
      return false;
    }

    return true;

  }

}
