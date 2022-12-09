import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CompanyDetails} from '../models/company-details';
import {SellerPermissions} from '../models/seller-permissions';
import {SystemBehavior} from '../models/system-behavior';
import {SystemResources} from '../models/system-resources';
import {CatalogSettings} from '../models/catalog-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient) {
  }

  /**
   * Realiza a consulta das configurações da empresa
   */
  loadCompanyDetails() {
    return this.http.get<CompanyDetails>('companyDetails');
  }

  /**
   * Atualiza os detalhes da empresa
   * @param companyDetails Detalhes da empresa
   */
  updateCompanyDetails(companyDetails: CompanyDetails) {
    return this.http.patch('companyDetails', JSON.stringify(companyDetails));
  }

  /**
   * Realiza a consulta das permissões do vendedor
   */
  loadSellerPermissions() {
    return this.http.get<SellerPermissions>('sellerPermissions');
  }

  /**
   * Atualiza as permissões do vendedor
   * @param sellerPermissions Permissões do vendedor
   */
  updateSellerPermissions(sellerPermissions: SellerPermissions) {
    return this.http.patch('sellerPermissions', JSON.stringify(sellerPermissions));
  }

  /**
   * Realiza a consulta das permissões do vendedor
   */
  loadCatalogSettings() {
    return this.http.get<CatalogSettings>('systemCatalog');
  }

  /**
   * Atualiza as permissões do vendedor
   * @param catalogSettings Permissões do vendedor
   */
  updateCatalogSettings(catalogSettings: CatalogSettings) {
    return this.http.patch('systemCatalog', JSON.stringify(catalogSettings));
  }

  /**
   * Realiza a consulta dos comportamentos do sistema
   */
  loadSystemBehavior() {
    return this.http.get<SystemBehavior>('systemBehavior');
  }

  /**
   * Atualiza as configurações de comportamentos do sistema
   * @param systemBehavior Configurações de comportamentos do sistema
   */
  updateSystemBehavior(systemBehavior: SystemBehavior) {
    return this.http.patch('systemBehavior', JSON.stringify(systemBehavior));
  }

  /**
   * Realiza a consulta dos recursos do sistema
   */
  loadSystemResources() {
    return this.http.get<SystemBehavior>('systemResources');
  }

  /**
   * Atualiza as configurações dos recursos do sistema
   * @param systemResources Configurações de recursos do sistema
   */
  updateSystemResources(systemResources: SystemResources) {
    return this.http.patch('systemResources', JSON.stringify(systemResources));
  }

  /**
   * Realiza a alteração da senha dos vendedores
   * @param newPassword A nova senha
   */
  updateSellersPassword(newPassword: string) {
    const data = {password: newPassword};
    return this.http.patch('sellerPasswordChange', JSON.stringify(data));
  }

}
