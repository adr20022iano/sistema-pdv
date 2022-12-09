<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Source\Controller\PDV\QuoteApi AS QuoteApiPDV;
use Exception;
use Source\Models\ForcaVendas\Authentication;

class QuoteApi extends QuoteApiPDV {

    protected int $type = 7;
    protected int $origin = 2;

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

        $this->sale->setOrigin($this->origin);
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
    public function readAll(): void {

        $_GET['origin'] = 2;
        $_GET['sellerCode'] = $this->token->getSellerCode();

        parent::readAll();

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        $this->sale->setSellerCode($this->token->getSellerCode());

        parent::read($data);

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto para consulta
        $this->saleFilter->setCode($this->obj->code);
        $quoteLine = $this->quoteDao->read($this->saleFilter);

        // Verifica se tem resultado
        if ((!$quoteLine) || ($this->token->getSellerCode() <> $quoteLine->sellerCode)) {

            throw new Exception("Não foi possível alterar esse orçamento.", 403);

        }

        // Seta valores recebidos
        $this->obj->sellerCode = $this->token->getSellerCode();

        parent::update();

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {

        $this->saleFilter->setSellerCode($this->token->getSellerCode());

        parent::delete($data);

    }

}
