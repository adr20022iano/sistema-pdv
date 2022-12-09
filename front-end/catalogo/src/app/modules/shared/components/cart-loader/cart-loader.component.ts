import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'clpdv-cart-loader',
  templateUrl: './cart-loader.component.html',
  styleUrls: ['./cart-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartLoaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
