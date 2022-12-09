<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Source\Controller\PDV\CompanyDetailsApi AS CompanyDetailsApi;
use Exception;

class SystemResourcesApi extends CompanyDetailsApi {

    /**
     * Consulta os registros
     */
    public function read(): void {

        // Consulta assinatura
        $line = $this->signatureDao->read();

        // Renderização da view
        view(200, [
            "scaleIntegration" => (bool) $line->scaleIntegration,
            "useProductImage" => (bool) $line->useProductImage
        ]);

    }

    /**
     * Atualiza um registro
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto
        if (!empty($this->obj->scaleIntegration)) {
            $this->signature->setScaleIntegration($this->obj->scaleIntegration);
        }

        if (!empty($this->obj->useProductImage)) {
            $this->signature->setUseProductImage($this->obj->useProductImage);
        }

        $this->signatureDao->upSystemResources($this->signature);

        // Renderização da view
        view(204);

    }

}
