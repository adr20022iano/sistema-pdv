import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Customer} from '../models/customer';
import {CustomersFilter} from '../models/customer-filter';
import {BehaviorSubject, Observable} from 'rxjs';
import {CnpjConsult} from '../models/cnpj-consult';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  /** Cliente selecionado para uma nova venda */
  private customerForNewSale = new BehaviorSubject<Customer>(null);

  constructor(private http: HttpClient) {
  }

  /**
   * Cria ou atualiza o cliente informado.
   * @param customer Vendedor que será adicionado ou atualizado.
   *
   * Esta função verifica se o parâmetro `cod` do cliente foi especificado
   * para determinar se deve executar o método `POST` ou `PATCH`.
   */
  saveCustomer(customer: Customer) {

    if (customer.code) {
      return this.http.patch<Customer>('customer', JSON.stringify(customer));
    } else {
      return this.http.post<Customer>('customer', JSON.stringify(customer));
    }

  }

  /**
   * Realiza a consulta de todos os clientes cadastrados no sistema
   */
  getCustomers(filter: CustomersFilter) {

    let queryParams = new HttpParams();
    if (filter.name) {
      queryParams = queryParams.set('name', filter.name);
    }
    if (filter.page) {
      queryParams = queryParams.set('page', filter.page.toString());
    }
    if (filter.city) {
      queryParams = queryParams.set('city', filter.city);
    }
    if (filter.sale) {
      queryParams = queryParams.set('sale', filter.sale.toString());
    }
    if (filter.catalog) {
      queryParams = queryParams.set('catalog', filter.catalog.toString());
    }
    if (filter.email) {
      queryParams = queryParams.set('email', filter.email);
    }
    if (filter.document) {
      queryParams = queryParams.set('document', filter.document);
    }

    return this.http.get<Customer[]>(`customer`, {params: queryParams});

  }

  /**
   * Realiza a consulta dos dados de um cliente específico.
   * @param customerCode Código do cliente a ser consultado.
   */
  getCustomerInfo(customerCode: number) {
    return this.http.get<Customer>(`customer/${customerCode}`);
  }

  /**
   * Deleta o cliente de acordo com o código informado.
   * @param customerCode Código do cliente que será excluído.
   *
   * Quando um cliente é deletado, suas informações são removidas de
   * todos os registros das vendas, porém os registros das mesmas são mantidos.
   */
  deleteCustomer(customerCode: number) {
    return this.http.delete(`customer/${customerCode}`);
  }

  /**
   * Define um cliente no componente para ser carregado
   * quando a nova venda for carregada.
   * @param customer O cliente que será utilizado na nova venda.
   */
  setCustomerForSale(customer: Customer): void {
    this.customerForNewSale.next(customer);
  }

  /**
   * Recupera o cliente selecionado para uma nova venda.
   */
  getNewSaleCustomer(): Customer {
    const customer = this.customerForNewSale.getValue();
    this.customerForNewSale.next(null);
    return customer;
  }

  /**
   * Realiza a consulta de um cnpj na receita federal.
   * @param cnpj O cnpj que será consultado
   */
  consultCNPJ(cnpj: string): Observable<CnpjConsult> {
    return this.http.get<CnpjConsult>('cnpjQuery/'.concat(cnpj));
  }

}
