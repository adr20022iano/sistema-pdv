import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {NewSaleService} from '../../../services/new-sale.service';
import {Customer} from '../../../../customers/models/customer';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'lpdv-fv-blocked-sale-info',
  templateUrl: './blocked-sale-info.component.html',
  styleUrls: ['./blocked-sale-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockedSaleInfoComponent implements OnInit {

  /** O cliente da venda */
  customer: BehaviorSubject<Customer>;

  /** O subtotal de produtos */
  productsValue: BehaviorSubject<number>

  /** O valor da venda */
  saleTotal: BehaviorSubject<number>

  /** O desconto da venda */
  discount: BehaviorSubject<number>;

  /** O valor de frete da venda */
  shipping: BehaviorSubject<number>;

  /** A observação da venda */
  observation: BehaviorSubject<string>;

  /** O código da venda */
  saleCode: BehaviorSubject<number>;

  constructor(private newSaleService: NewSaleService) {

    this.saleCode = newSaleService.saleBeingEditedCodeAsync;
    this.customer = newSaleService.saleCustomer;
    this.saleTotal = newSaleService.saleTotal;
    this.productsValue = newSaleService.productsSubtotal;
    this.discount = newSaleService.discountValue;
    this.shipping = newSaleService.shippingValue;
    this.observation = newSaleService.saleObservation;

  }

  ngOnInit(): void {
  }

}
