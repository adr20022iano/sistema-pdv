<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\CnpjQueryApi AS CnpjQueryApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class CnpjQueryApi extends CnpjQueryApiPDV {

    protected int $type = 7;

    /**
     * CustomerApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        new Authentication($this->token->getUserName(), $this->token->getSellerCode());

    }

}
