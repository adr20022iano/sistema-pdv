<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\BaseModels\Customer\CustomerFilter;
use Source\Models\PDV\Customer\CustomerDao;
use Source\Models\PDV\Sale\SaleDao;
use Source\Models\PDV\Sale\SaleFilter;
use Source\Models\PDV\SalePayment\SalePayment;
use Source\Models\PDV\SalePayment\SalePaymentDao;

class MultipleSalesPaymentApi {

    protected Token $token;
    protected ?object $obj;
    protected CustomerFilter $customerFilter;
    protected CustomerDao $customerDao;
    protected SaleFilter $saleFilter;
    protected SaleDao $saleDao;
    protected SalePayment $salePayment;
    protected SalePaymentDao $salePaymentDao;

    /**
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->customerFilter = new CustomerFilter();
        $this->customerDao = new CustomerDao($this->token->getUserName());
        $this->saleFilter = new SaleFilter();
        $this->saleDao = new SaleDao($this->token->getUserName());
        $this->salePayment = new SalePayment();
        $this->salePaymentDao = new SalePaymentDao($this->token->getUserName());

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        // Monta objeto
        $this->customerFilter->setCode($this->obj->customerCode);
        $customerData = $this->customerDao->read($this->customerFilter);

        // Verifica se tem resultado
        if (empty($customerData)) {
            throw new Exception("Cliente não encontrado.", 404);
        }

        // Verifica se o valor informado é maior que o débito do cliente
        $paymentAmount = min($this->obj->value, $customerData->debt);

        // Monta objeto
        $this->saleFilter->setNoPagination(true);
        $this->saleFilter->setPaymentStatus(3);
        $this->saleFilter->setCustomerCode($customerData->code);

        // Vendas
        foreach (array_reverse($this->saleDao->readAll($this->saleFilter)) as $line) {

            // Verifica se tem saldo ainda
            if ($paymentAmount <= 0) {
                break;
            }

            // Valor do débito do pedido
            $debtAmount = ($line->productsValue + $line->shipping) - $line->discount - $line->paidValue;

            // Verifica o valor da baixa
            if ($debtAmount > $paymentAmount) {

                $value = $paymentAmount;
                $paymentAmount = 0;

            } else {

                $value = $debtAmount;
                $paymentAmount -= $debtAmount;

            }

            // Verifica o valor
            if ($value > 0) {

                // Monta objeto
                $this->salePayment->setSaleCode($line->code);
                $this->salePayment->setValue($value);
                $this->salePayment->setType(1);
                $this->salePaymentDao->create($this->salePayment);

            }

        }

        // Renderização da view
        view(201);

    }

}
