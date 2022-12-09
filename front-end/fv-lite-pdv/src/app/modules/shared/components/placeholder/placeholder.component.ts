import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'lpdv-fv-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent implements OnInit {

  /** Texto exibido no placeHolder */
  @Input() placeholder: string;

  /** Texto secundário exibido */
  @Input() secondaryText: string;


  constructor() { }

  ngOnInit(): void {
  }

}
