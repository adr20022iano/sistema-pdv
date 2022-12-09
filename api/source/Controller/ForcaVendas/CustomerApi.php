<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\CustomerApi AS CustomerApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class CustomerApi extends CustomerApiPDV {

    protected int $type = 7;

    /**
     * CustomerApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        new Authentication($this->token->getUserName(), $this->token->getSellerCode());

    }

    /**
     * Consulta todos registros
     * @throws Exception
     */
    public function readAll(): void {

        $_GET['sale'] = true;
        $_GET['catalog'] = null;

        parent::readAll();

    }

}
