import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'clpdv-product-loader',
  templateUrl: './product-loader.component.html',
  styleUrls: ['./product-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductLoaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
