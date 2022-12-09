import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'lpdv-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFoundComponent implements OnInit {

  /** Se o usuário está logado ou não */
  isUserLoggedIn: boolean;

  constructor(private authService: AuthService) {
    this.isUserLoggedIn = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
  }

}
