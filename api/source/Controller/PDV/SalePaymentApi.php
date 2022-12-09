<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\SalePayment\SalePayment;
use Source\Models\PDV\SalePayment\SalePaymentDao;
use Source\Models\PDV\Signature\SignatureDao;

class SalePaymentApi {

    protected Token $token;
    protected ?object $obj;
    protected SalePayment $salePayment;
    protected SalePaymentDao $salePaymentDao;
    protected SignatureDao $signatureDao;
    protected int $type = 2;

    /**
     * salePaymentApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->salePayment = new SalePayment();
        $this->salePaymentDao = new SalePaymentDao($this->token->getUserName());
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
    
    }

    /**
     * @throws Exception
     */
    public function create(): void {

        // Monta objeto
        $this->salePayment->setSaleCode($this->obj->saleCode);
        $this->salePayment->setValue($this->obj->value);
        $this->salePayment->setType($this->obj->type);
        $this->salePaymentDao->create($this->salePayment);

        // Renderização da view
        view(201,["code" => $this->salePayment->getCode()]);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {
    
        // Monta objeto
        $this->salePayment->setSaleCode($data['saleCode']);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->salePaymentDao->read($this->salePayment) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "type" => (int) $line->type,
                "value" => round($line->value,2),
                "date" => dateJson($line->date)
            ];

        }

        // Renderização da view
        view(200, $list);
    
    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {

            // Consulta assinatura
            $signature = $this->signatureDao->read();

            if (!$signature->sellerDeletePayment) {
                trueExceptionAccess();
            }

        }

        // Monta objeto
        $this->salePayment->setCode($data['code']);
        $this->salePaymentDao->delete($this->salePayment);

        // Renderização da view
        view(204);
    
    }
    
}
