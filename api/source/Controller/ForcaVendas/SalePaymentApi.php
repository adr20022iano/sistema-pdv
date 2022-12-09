<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\SalePaymentApi AS SalePaymentApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class SalePaymentApi extends SalePaymentApiPDV {

    protected int $type = 7;

    /**
     * SalePaymentApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        new Authentication($this->token->getUserName(), $this->token->getSellerCode());

    }

}
