<?php

namespace Source\Controller\PDV;

use Source\Controller\PDV\CompanyDetailsApi AS CompanyDetailsApi;
use Exception;

class SystemCatalogApi extends CompanyDetailsApi {

    /**
     * Consulta os registros
     */
    public function read(): void {

        // Consulta assinatura
        $line = $this->signatureDao->read();

        // Renderização da view
        view(200, [
            "showPriceOnCatalogAfterLogin" => (bool) $line->showPriceOnCatalogAfterLogin
        ]);

    }

    /**
     * Atualiza um registro
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto
        if (!empty($this->obj->showPriceOnCatalogAfterLogin)) {
            $this->signature->setShowPriceOnCatalogAfterLogin($this->obj->showPriceOnCatalogAfterLogin);
        }

        $this->signatureDao->upSystemCatalog($this->signature);

        // Renderização da view
        view(204);

    }

}
