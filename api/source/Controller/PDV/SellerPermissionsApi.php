<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Source\Controller\PDV\CompanyDetailsApi AS CompanyDetailsApi;
use Exception;

class SellerPermissionsApi extends CompanyDetailsApi {

    /**
     * Consulta os registros
     */
    public function read(): void {

        // Consulta assinatura
        $line = $this->signatureDao->read();

        // Renderização da view
        view(200, [
            "sellerDeletePayment" => (bool) $line->sellerDeletePayment,
            "sellerDeleteSale" => (bool) $line->sellerDeleteSale,
            "sellerSalesReport" => (bool) $line->sellerSalesReport,
            "sellerDiscount" => (bool) $line->sellerDiscount
        ]);

    }

    /**
     * Atualiza um registro
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto
        if (!empty($this->obj->sellerDeletePayment)) {
            $this->signature->setSellerDeletePayment($this->obj->sellerDeletePayment);
        }

        if (!empty($this->obj->sellerDeleteSale)) {
            $this->signature->setSellerDeleteSale($this->obj->sellerDeleteSale);
        }

        if (!empty($this->obj->sellerSalesReport)) {
            $this->signature->setSellerSalesReport($this->obj->sellerSalesReport);
        }

        if (!empty($this->obj->sellerDiscount)) {
            $this->signature->setSellerDiscount($this->obj->sellerDiscount);
        }

        $this->signatureDao->upSellerPermissions($this->signature);

        // Renderização da view
        view(204);

    }

}
