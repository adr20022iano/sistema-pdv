<?php  /** @noinspection PhpUnused */

namespace Source\Controller\Catalogo;

use Source\Controller\PDV\ProductApi as ProductApiPDV;
use Exception;
use Source\Models\PDV\Signature\SignatureDao;

class ShopCartApi extends ProductApiPDV {

    protected int $type = 6;
    protected SignatureDao $signatureDao;

    /**
     * ShopCartApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        // Consulta assinatura
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $signature = $this->signatureDao->read();

        // Verifica contratação do módulo de catálogo
        if (!$signature->catalogModule) {

            trueExceptionCatalogModule();

        }

    }

    /**
     * Consulta os produtos
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        $this->productFilter->setNoPagination(true);
        $this->productFilter->setCodes(explode(',', $_GET['product']));

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->productDao->readAll($this->productFilter) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "unit" => $line->unit,
                "categoryName" => $line->categoryName,
                "value" => round($line->value,2),
                "unavailable" => (!$line->catalogSale) || ($line->stock <= 0),
                "image" => $this->images->query($line->code)
            ];

        }

        // Renderização da view
        view(200, $this->productFilter->optimizeFilter($list, $this->productFilter->getName()));

    }

}
