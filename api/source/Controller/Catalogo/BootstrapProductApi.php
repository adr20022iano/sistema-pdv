<?php  /** @noinspection PhpUnused */

namespace Source\Controller\Catalogo;

use Exception;
use Source\Core\ImageBase64;
use Source\Core\Token;
use Source\Models\BaseModels\Signature\SignatureDao;
use Source\Models\PDV\Product\Product;
use Source\Models\Catalogo\Product\BootstrapProductDao;

class BootstrapProductApi {

    private Token $token;
    private SignatureDao $signatureDao;
    private BootstrapProductDao $bootstrapProductDao;
    private Product $product;
    private ImageBase64 $images;
    private object $signature;

    /**
     * ProductApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(6);
        $this->token->decode(apache_request_headers());

        $this->product = new Product();
        $this->bootstrapProductDao = new BootstrapProductDao($this->token->getUserName());
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);

        // Configuração das imagens
        $this->images = new ImageBase64(
            $this->token->getFolder()."/products",
            $this->product->getImagesArray()
        );

        // Consulta assinatura
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $this->signature = $this->signatureDao->read();

        // Verifica contratação do módulo de catálogo
        if (!$this->signature->catalogModule) {

            trueExceptionCatalogModule();

        }

    }

    /**
     * Consulta os produtos de apresentação aleatórios
     * @throws Exception
     */
    public function read(): void {

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->bootstrapProductDao->readCategory() as $line) {

            // Inicia variáveis
            $products = [];

            // Monta a lista
            foreach ($this->bootstrapProductDao->readProduct($line->categoryCode) as $productLine) {

                $product = [
                    "code" => (int) $productLine->code,
                    "name" => ucfirst(mb_strtolower($productLine->name)),
                    "stock" => (float) $productLine->stock,
                    "unit" => $productLine->unit,
                    "categoryName" => $productLine->categoryName,
                    "value" => round($productLine->value,2),
                    "image" => $this->images->query($productLine->code),
                    "catalogDetails" => $productLine->catalogDetails
                ];

                // Remove o preço se não estiver logado
                if (($this->signature->showPriceOnCatalogAfterLogin) and (empty($this->token->getCustomerCode()))) {

                    unset($product["value"]);

                }

                $products[] = $product;

            }

            $list[] = [
                "name" => ucfirst(mb_strtolower($line->name)),
                "code" => (int) $line->categoryCode,
                "products" => $products
            ];

        }

        // Renderização da view
        view(200, $list);

    }

}
