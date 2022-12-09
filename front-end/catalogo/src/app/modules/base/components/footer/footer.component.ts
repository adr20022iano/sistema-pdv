import {Component, OnInit, ChangeDetectionStrategy, Input, OnChanges} from '@angular/core';
import {Bootstrap} from '@base/models/bootstrap';
import {DcSideMenu} from '@devap-br/devap-components/side-menu';
import {ContactComponent} from '@base/components/contact/contact.component';

@Component({
  selector: 'clpdv-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit, OnChanges {

  /**
   * Dados de bootstrap do catálogo
   */
  @Input() bootstrap: Bootstrap;

  /** O ano atual para copyright */
  currentYear = new Date();

  /** Informações da empresa */
  companyInfo: string;

  constructor(private sideMenu: DcSideMenu) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {

    if (this.bootstrap?.config.name) {

      this.companyInfo = this.bootstrap.config.name;
      if (this.bootstrap.config.document?.length === 18) {
        this.companyInfo = this.companyInfo.concat(' - ', this.bootstrap.config.document);
      }

    }

  }

  /**
   * Abre a janela de contato do cliente.
   */
  openContact(): void {
    this.sideMenu.open(ContactComponent,  {autoFocus: false});
  }

}
