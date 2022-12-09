import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import {Customer} from '../../../../customers/models/customer';

@Component({
  selector: 'lpdv-fv-customer-layout',
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerLayoutComponent implements OnInit {

  /** Cliente exibido no componente */
  @Input() customer: Customer;

  /** A string que está sendo filtrada */
  @Input() queryString: string;

  /** O nome do cliente exibido */
  customerName: string;

  /** O apelido do cliente exibido */
  customerNickname: string;

  /** O telefone do cliente exibido */
  customerPhone: string;

  constructor() {
  }

  ngOnInit(): void {

    if (this.queryString) {

      const searchRegex = new RegExp(this.queryString, 'gi');

      if (this.customer.nickname) {
        this.customerNickname = this.customer.nickname
          .replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));
      }

      if (this.customer.phone) {
        this.customerPhone = this.customer.phone
          .replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));
      }

      this.customerName = this.customer.name
        .replace(searchRegex, '<span class="highlight">'.concat(this.queryString.toUpperCase(), '</span>'));

    } else {

      this.customerName = this.customer.name;
      this.customerNickname = this.customer.nickname;
      this.customerPhone = this.customer.phone;

    }

  }

}
