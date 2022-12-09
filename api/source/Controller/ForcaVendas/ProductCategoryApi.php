<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\ProductCategoryApi AS ProductCategoryApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class ProductCategoryApi extends ProductCategoryApiPDV {

    protected int $type = 7;

    /**
     * productCategoryApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        new Authentication($this->token->getUserName(), $this->token->getSellerCode());

    }

}
