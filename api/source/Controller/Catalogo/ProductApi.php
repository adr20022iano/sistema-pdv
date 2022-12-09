<?php  /** @noinspection PhpUnused */

namespace Source\Controller\Catalogo;

use Source\Controller\PDV\ProductApi as ProductApiPDV;
use Exception;
use Source\Models\BaseModels\Signature\SignatureDao;

class ProductApi extends ProductApiPDV {

    protected int $type = 6;
    protected SignatureDao $signatureDao;
    private object $signature;

    /**
     * ProductApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        // Consulta assinatura
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $this->signature = $this->signatureDao->read();

        // Verifica contratação do módulo de catálogo
        if (!$this->signature->catalogModule) {

            trueExceptionCatalogModule();

        }

    }

    /**
     * Consulta os registros
     * @throws Exception
     */
    public function readAll(?array $unset = null): void {

        $_GET['sale'] = true;
        $_GET['production'] = null;
        $_GET['catalogSale'] = true;

        $unset = [
            'location',
            'barCode',
            'cost'
        ];

        // Remove o preço se não estiver logado
        if (($this->signature->showPriceOnCatalogAfterLogin) and (empty($this->token->getCustomerCode()))) {

            $unset[] = "value";

        }

        parent::readAll($unset);

    }

}
