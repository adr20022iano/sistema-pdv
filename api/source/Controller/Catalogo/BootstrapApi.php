<?php  /** @noinspection PhpUnused */

namespace Source\Controller\Catalogo;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\ProductCategory\ProductCategoryDao;
use Source\Models\BaseModels\Signature\SignatureDao;

class BootstrapApi {

    private Token $token;
    private SignatureDao $signatureDao;
    private ProductCategoryDao $productCategoryDao;
    private object $signature;

    /**
     * BootstrapApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(6);
        $this->token->decode(apache_request_headers());

        $this->productCategoryDao = new ProductCategoryDao($this->token->getUserName());

        // Consulta assinatura
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $this->signature = $this->signatureDao->read();

        // Verifica contratação do módulo de catálogo
        if (!$this->signature->catalogModule) {

            trueExceptionCatalogModule();

        }

    }

    /**
     * Consulta as configurações
     * @throws Exception
     */
    public function read(): void {

        // Inicia variáveis
        $productCategoryList = [];
        $favoriteCategoryList = [];

        // Monta a lista
        foreach ($this->productCategoryDao->read() as $line) {

            $productCategoryList[] = [
                "code" => (int) $line->code,
                "name" => ucfirst(mb_strtolower($line->name))
            ];

            // Verifica se é favorita
            if ($line->favorite) {

                $favoriteCategoryList[] = [
                    "code" => (int) $line->code,
                    "name" => ucfirst(mb_strtolower($line->name))
                ];

            }

        }

        // Renderização da view
        view(200, [
            "config" => [
                "name" => $this->signature->name,
                "fantasyName" => $this->signature->fantasyName,
                "document" => $this->signature->document,
                "city" => $this->signature->city,
                "district" => $this->signature->district,
                "cep" => $this->signature->cep,
                "address" => $this->signature->address,
                "number" => $this->signature->number,
                "complement" => $this->signature->complement,
                "phone" => $this->signature->phone
            ],
            "favoriteCategoryList" => $favoriteCategoryList,
            "productCategoryList" => $productCategoryList
        ]);

    }

}
