<?php  /** @noinspection PhpUnused */

namespace Source\Controller\Catalogo;

use Source\Controller\PDV\SaleApi AS SaleApiPDV;
use Exception;
use Source\Models\BaseModels\Customer\CustomerFilter;
use Source\Models\PDV\Customer\CustomerDao;
use Source\Models\PDV\Signature\SignatureDao;

class SaleApi extends SaleApiPDV {

    protected int $type = 6;
    protected SignatureDao $signatureDao;
    protected CustomerFilter $customerFilter;
    protected CustomerDao $customerDao;

    /**
     * ProductApi constructor.
     * @throws Exception
     */
    public function __construct() {

        parent::__construct();

        // Consulta assinatura
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $signature = $this->signatureDao->read();

        // Verifica contratação do módulo de catálogo
        if (!$signature->catalogModule) {

            trueExceptionCatalogModule();

        }

        //  Consulta usuário logado
        $this->customerFilter = new CustomerFilter();
        $this->customerDao = new CustomerDao($this->token->getUserName());

        // Verifica se tem permissão de acesso ao catálogo
        $this->customerFilter->setCode($this->token->getCustomerCode());
        if (!$this->customerDao->read($this->customerFilter)->catalogAccess) {

            trueExceptionLogin();

        }

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        $this->sale->setOrigin(1);
        $this->sale->setCustomerCode($this->token->getCustomerCode());

        parent::create();

    }

    /**
     * @throws Exception
     */
    public function readAll(?array $unset = null): void {

        $_GET['customerCode'] = $this->token->getCustomerCode();

        $unset = [
            'locked',
            'customer',
            'origin',
            'saleChange',
            'saleChange',
            'unpaidValue'
        ];

        parent::readAll($unset);

    }

    /**
     * @param array $data
     * @param array|null $unset
     * @throws Exception
     */
    public function read(array $data, ?array $unset = null): void {

        // Monta objeto para consulta
        $this->saleFilter->setCustomerCode($this->token->getCustomerCode());

        $unset = [
            'locked',
            'customer',
            'print'
        ];

        parent::read($data, $unset);

    }

}
