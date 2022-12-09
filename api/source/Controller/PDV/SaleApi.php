<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\ImageBase64;
use Source\Core\Token;
use Source\Models\PDV\Product\Product;
use Source\Models\PDV\Quote\QuoteDao;
use Source\Models\PDV\Sale\Sale;
use Source\Models\PDV\Sale\SaleDao;
use Source\Models\PDV\Sale\SaleFilter;
use Source\Models\PDV\Sale\SaleService;
use Source\Models\PDV\SalePayment\SalePayment;
use Source\Models\PDV\SalePayment\SalePaymentDao;
use Source\Models\PDV\Signature\SignatureDao;

class SaleApi {

    protected Token $token;
    protected ?object $obj;
    protected SaleService $saleService;
    protected Sale $sale;
    protected SaleFilter $saleFilter;
    protected SaleDao $saleDao;
    protected SalePayment $salePayment;
    protected SalePaymentDao $salePaymentDao;
    protected SignatureDao $signatureDao;
    protected Product $product;
    protected ImageBase64 $images;
    protected SaleFilter $quoteFilter;
    protected QuoteDao $quoteDao;
    protected int $type = 2;

    /**
     * saleApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->product = new Product();
        $this->saleService = new SaleService($this->token, $this->type, 0);
        $this->sale = new Sale();
        $this->saleFilter = new SaleFilter();
        $this->saleDao = new SaleDao($this->token->getUserName());
        $this->salePayment = new SalePayment();
        $this->salePaymentDao = new SalePaymentDao($this->token->getUserName());
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $this->quoteFilter = new SaleFilter();
        $this->quoteDao = new QuoteDao($this->token->getUserName());

        // Configuração das imagens
        $this->images = new ImageBase64($this->token->getFolder()."/products", $this->product->getImagesArray());

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        $this->sale = $this->saleService->setData($this->sale, $this->obj);

        // Verifica troco
        if (!empty($this->obj->saleChange)) {
            $this->sale->setSaleChange($this->obj->saleChange);
        }

        // Regista a venda
        $this->saleDao->create($this->sale);

        // Verifica se a origem é um orçamento para deletar
        if (!empty($this->obj->quoteCode)) {

            // Monta objeto
            $this->quoteFilter->setCode($this->obj->quoteCode);
            $this->quoteDao->delete($this->quoteFilter);

        }

        // Verifica tipo
        if ($this->type === 2) {

            // Monta objeto
            $this->salePayment->setSaleCode($this->sale->getCode());

            // Verifica se informou algum valore recebido
            // Dinheiro/cheque
            if (!empty($this->obj->cash)) {

                $this->salePayment->setValue($this->obj->cash - $this->sale->getSaleChange());
                $this->salePayment->setType(1);
                $this->salePaymentDao->create($this->salePayment);

            }

            // Cartão de crédito
            if (!empty($this->obj->credit)) {

                $this->salePayment->setValue(abs($this->obj->credit));
                $this->salePayment->setType(2);
                $this->salePaymentDao->create($this->salePayment);

            }

            // Cartão de débito
            if (!empty($this->obj->debit)) {

                $this->salePayment->setValue(abs($this->obj->debit));
                $this->salePayment->setType(3);
                $this->salePaymentDao->create($this->salePayment);

            }

            // Outros meios de pagamento
            if (!empty($this->obj->others)) {

                $this->salePayment->setValue(abs($this->obj->others));
                $this->salePayment->setType(4);
                $this->salePaymentDao->create($this->salePayment);

            }

        }

        // Renderização da view
        view(201,["code" => $this->sale->getCode()]);

    }

    /**
     * @param array $data
     * @param array|null $unset
     * @throws Exception
     */
    public function read(array $data, ?array $unset = null): void {

        // Monta objeto para consulta
        $this->saleFilter->setCode($data['code']);
        $saleLine = $this->saleDao->read($this->saleFilter);

        // Verifica se tem resultado 
        if (empty($saleLine)) {

            throw new Exception("Venda não encontrada.", 404);

        }

        // Inicia variáveis
        $products = [];

        // Monta a lista
        foreach ($this->saleDao->readProdutosSale($this->saleFilter) as $line) {

            $products[] = $this->saleService->readProducts($line);

        }

        // Monta array
        $list = $this->saleService->read($saleLine, $products);

        // Renderização da view
        view(200, $this->saleService->salePrint($list));

    }

    /**
     * @throws Exception
     */
    public function readAll(?array $unset = null): void {

        // Monta objeto
        $this->saleFilter = $this->saleService->setFilter($this->saleFilter);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->saleDao->readAll($this->saleFilter) as $line) {

            $data = [
                "code" => (int) $line->code,
                "origin" => (int) $line->origin,
                "locked" => (bool) $line->locked,
                "date" => dateJson($line->date),
                "value" => round(($line->productsValue + $line->shipping) - $line->discount, 2),
                "paidValue" => round($line->paidValue, 2),
                "saleChange" => round($line->saleChange, 2),
                "seller" => !empty($line->sellerName) ? $line->sellerName : null,
                "customer" => [
                    "code" => (int) !empty($line->customerCode) ? $line->customerCode : null,
                    "name" => !empty($line->customerName) ? $line->customerName : null,
                    "nickname" => !empty($line->customerNickname) ? $line->customerNickname : null
                ]
            ];

            // Verifica se remove campos do array
            if (is_array($unset)) {

                foreach ($unset as $value) {

                    unset($data[$value]);

                }

            }

            $list[] = $data;

        }

        // Renderização da view
        view(200, $list);

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        $this->sale = $this->saleService->setData($this->sale, $this->obj);
        $this->sale->setCode($this->obj->code);
        $this->saleDao->update($this->sale);

        // Renderização da view
        view(204);

    }

    /**
     * Atualiza o bloqueio da venda
     * @throws Exception
     */
    public function updateLocked(): void {

        if (!empty($this->obj->locked)) {
            $this->sale->setLocked(true);
        }

        $this->sale->setCode($this->obj->code);
        $this->saleDao->updateLocked($this->sale);

        // Renderização da view
        view(204);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {

            if (!$this->signatureDao->read()->sellerDeleteSale) {
                trueExceptionAccess();
            }

        }

        // Monta objeto
        $this->sale->setCode($data['code']);
        $this->saleDao->delete($this->sale);

        // Renderização da view
        view(204);

    }

}
