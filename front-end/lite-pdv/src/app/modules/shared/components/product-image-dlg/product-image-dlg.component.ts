import {Component, OnInit, ChangeDetectionStrategy, Inject} from '@angular/core';
import {DC_DIALOG_DATA} from '@devap-br/devap-components/dialog';
import {Product} from '../../../products/models/product';
import {BehaviorSubject} from 'rxjs';
import {LoaderStatus} from '@devap-br/devap-components/loader';

@Component({
  selector: 'lpdv-product-image-dlg',
  templateUrl: './product-image-dlg.component.html',
  styleUrls: ['./product-image-dlg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductImageDlgComponent implements OnInit {

  /** Status do carregamento */
  status = new BehaviorSubject<LoaderStatus>('carregando');

  constructor(@Inject(DC_DIALOG_DATA) public product: Product) {
  }

  ngOnInit(): void {
  }

  imageLoaded() {
    this.status.next('pronto');
  }
}
