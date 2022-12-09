<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\ImageBase64;
use Source\Core\Token;
use Source\Models\PDV\Product\Product;
use Source\Models\PDV\Sale\Sale;
use Source\Models\PDV\Quote\QuoteDao;
use Source\Models\PDV\Sale\SaleFilter;
use Source\Models\PDV\Sale\SaleService;

class QuoteApi {

    protected Token $token;
    protected ?object $obj;
    protected SaleService $saleService;
    protected Sale $sale;
    protected SaleFilter $saleFilter;
    protected QuoteDao $quoteDao;
    protected Product $product;
    protected ImageBase64 $images;
    protected int $type = 2;
    protected int $origin = 0;
    protected object $signatureData;

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
        $this->quoteDao = new QuoteDao($this->token->getUserName());
        $this->saleService = new SaleService($this->token, $this->type, 1);
        $this->sale = new Sale();
        $this->saleFilter = new SaleFilter();

        // Configuração das imagens
        $this->images = new ImageBase64($this->token->getFolder()."/products", $this->product->getImagesArray());

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        $this->sale = $this->saleService->setData($this->sale, $this->obj, true);

        // Regista o orçamento
        $this->quoteDao->create($this->sale);

        // Renderização da view
        view(201,["code" => $this->sale->getCode()]);

    }

    /**
     * @throws Exception
     */
    public function readAll(): void {

        // Monta objeto
        $this->saleFilter = $this->saleService->setFilter($this->saleFilter);
        $this->saleFilter->setOrigin($this->origin);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->quoteDao->readAll($this->saleFilter) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "origin" => (int) $line->origin,
                "date" => dateJson($line->date),
                "value" => round(($line->productsValue + $line->shipping) - $line->discount, 2),
                "seller" => !empty($line->sellerName) ? $line->sellerName : null,
                "customer" => [
                    "code" => (int) !empty($line->customerCode) ? $line->customerCode : null,
                    "name" => !empty($line->customerName) ? $line->customerName : null,
                    "nickname" => !empty($line->customerNickname) ? $line->customerNickname : null
                ]
            ];

        }

        // Renderização da view
        view(200, $list);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        // Monta objeto para consulta
        $this->saleFilter->setCode($data['code']);
        $quoteLine = $this->quoteDao->read($this->saleFilter);

        // Verifica se tem resultado
        if (empty($quoteLine)) {

            throw new Exception("Orçamento não encontrado.", 404);

        }

        // Inicia variáveis
        $products = [];

        // Monta a lista
        foreach ($this->quoteDao->readProdutosQuote($this->saleFilter) as $line) {

            $products[] = $this->saleService->readProducts($line);

        }

        // Monta array
        $list = $this->saleService->read($quoteLine, $products, false);

        // Renderização da view
        view(200, $this->saleService->salePrint($list));

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        $this->sale = $this->saleService->setData($this->sale, $this->obj, true);
        $this->sale->setCode($this->obj->code);
        $this->quoteDao->update($this->sale);

        // Renderização da view
        view(204);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {

        // Monta objeto
        $this->saleFilter->setcode($data['code']);
        $this->quoteDao->delete($this->saleFilter);

        // Renderização da view
        view(204);

    }

}
