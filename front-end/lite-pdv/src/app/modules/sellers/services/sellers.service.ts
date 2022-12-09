import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Seller} from '../models/seller';

@Injectable({
  providedIn: 'root'
})
export class SellersService {

  constructor(private http: HttpClient) {
  }

  /**
   * Cria ou atualiza o vendedor informado.
   * @param seller Vendedor que será adicionado ou atualizado.
   *
   * Esta função verifica se o parâmetro code do vendedor foi especificado
   * para determinar se deve executar o método POST ou PATCH
   */
  saveSeller(seller: Seller) {

    if (seller.code) {
      return this.http.patch<Seller>('seller', JSON.stringify(seller));
    } else {
      return this.http.post<Seller>('seller', JSON.stringify(seller));
    }

  }

  /**
   * Realiza a consulta de todos os vendedores cadastrados no sistema
   */
  getSellers() {
    return this.http.get<Seller[]>('seller');
  }

  /**
   * Deleta o vendedor conforme o código informado.
   * @param sellerCode Código do vendedor que será excluído.
   *
   * Quando um vendedor é deletado, suas informações são removidas de
   * todos os registros das vendas, porém os registros das mesmas são mantidos.
   */
  deleteSeller(sellerCode: number) {
    return this.http.delete('seller/'.concat(sellerCode.toString()));
  }

}
