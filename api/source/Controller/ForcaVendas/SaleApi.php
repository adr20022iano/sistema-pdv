<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\SaleApi AS SaleApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class SaleApi extends SaleApiPDV {

    protected int $type = 7;

    /**
     * SaleApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        new Authentication($this->token->getUserName(), $this->token->getSellerCode());

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        // Monta objeto
        $this->sale->setOrigin(2);
        $this->sale->setSellerCode($this->token->getSellerCode());

        // Seta valores recebidos
        $this->obj->cash = null;
        $this->obj->credit = null;
        $this->obj->debit = null;
        $this->obj->others = null;

        parent::create();

    }

    /**
     * @throws Exception
     */
    public function readAll(?array $unset = null): void {

        $_GET['origin'] = 2;
        $_GET['sellerCode'] = $this->token->getSellerCode();

        parent::readAll($unset);

    }

    /**
     * @param array $data
     * @param array|null $unset
     * @throws Exception
     */
    public function read(array $data, ?array $unset = null): void {

        $this->sale->setSellerCode($this->token->getSellerCode());

        parent::read($data, $unset);

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto para consulta
        $this->saleFilter->setCode($this->obj->code);
        $saleLine = $this->saleDao->read($this->saleFilter);

        // Verifica se tem resultado
        if ((!$saleLine) || ($saleLine->locked) || ($this->token->getSellerCode() <> $saleLine->sellerCode)) {

            throw new Exception("Pedido bloqueado para alteração.", 403);

        }

        // Seta valores recebidos
        $this->obj->sellerCode = $this->token->getSellerCode();

        parent::update();

    }

}
