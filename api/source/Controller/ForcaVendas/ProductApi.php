<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\ProductApi AS ProductApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class ProductApi extends ProductApiPDV {

    protected int $type = 7;

    /**
     * ProductApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        new Authentication($this->token->getUserName(), $this->token->getSellerCode());

    }

    /**
     * Consulta os registros
     * @throws Exception
     */
    public function readAll(?array $unset = null): void {

        $_GET['sale'] = true;
        $_GET['production'] = null;
        $_GET['catalogSale'] = null;

        $unset = [
            'location',
            'barCode',
            'cost'
        ];

        parent::readAll($unset);

    }

}
