<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Product\Product;
use Source\Models\PDV\Product\ProductDao;

class PriceUpdateApi {

    private Token $token;
    private ?object $obj;
    private Product $product;
    private ProductDao $productDao;

    /**
     * priceUpdateApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->product = new Product();
        $this->productDao = new ProductDao($this->token->getUserName());

        // Verifica se é admin
        if (!$this->token->getAdmin()) {
            trueExceptionAccess();
        }

    }
    
    /**
     * Atualiza um registro
     */
    public function update(): void {
    
        // Monta objeto
        $this->product->setCode($this->obj->code);

        if (!empty($this->obj->value)) {
            $this->product->setValue($this->obj->value);
        }

        if (!empty($this->obj->externalSaleValue)) {
            $this->product->setExternalSaleValue($this->obj->externalSaleValue);
        }

        $this->productDao->updateValue($this->product);

        // Renderização da view
        view(204);
    
    }
        
}
