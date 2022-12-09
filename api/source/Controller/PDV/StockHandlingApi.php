<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Product\Product;
use Source\Models\PDV\Product\ProductDao;
use Source\Models\PDV\Product\ProductFilter;
use Source\Models\PDV\Signature\SignatureDao;
use Source\Models\PDV\StockHandling\StockHandling;
use Source\Models\PDV\StockHandling\StockHandlingDao;
use Source\Models\PDV\StockHandling\StockHandlingFilter;

class StockHandlingApi {

    private Token $token;
    private ?object $obj;
    private Product $product;
    private ProductFilter $productFilter;
    private ProductDao $productDao;
    private StockHandling $stockHandling;
    private StockHandlingFilter $stockHandlingFilter;
    private StockHandlingDao $stockHandlingDao;
    private SignatureDao $signatureDao;
    protected int $type = 2;

    /**
     * stockHandlingApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->stockHandling = new StockHandling();
        $this->stockHandlingFilter = new StockHandlingFilter();
        $this->stockHandlingDao = new StockHandlingDao($this->token->getUserName(), $this->type);
        $this->product = new Product();
        $this->productFilter = new ProductFilter();
        $this->productDao = new ProductDao($this->token->getUserName(), $this->type);

        // Verifica se é Lite PDV
        if ($this->type === 2) {

            $this->signatureDao = new SignatureDao($this->token->getUserName(),2);

            // Consulta assinatura
            if (!$this->signatureDao->read()->calculateStock) {
                throw new Exception("Recurso desabilitado pelo administrador.", 400);
            }

        }

        // Verifica se é admin
        // E se o método nao é do tipo get
        if ((!$this->token->getAdmin()) and ($_SERVER['REQUEST_METHOD'] !== "GET")) {
            trueExceptionAccess();
        }

    }

    /**
     * @throws Exception
     */
    public function create(): void {
    
        // Verifica se o tipo é inválido
        if (
            ($this->obj->type !== 1) and
            ($this->obj->type !== 2) and
            ($this->obj->type !== 3)
        ) {

            throw new Exception("O tipo de movimentação é inválido.", 400);

        }

        // Verifica se vai atualizar o custo do produto
        if ((!empty($this->obj->cost)) and ($this->obj->type === 1)) {

            // Verifica filtro e monta objeto
            $this->productFilter->setTypeCode(0);
            $this->productFilter->setCode($this->obj->productCode);
            $product = $this->productDao->read($this->productFilter);

            if (!$product) {

                throw new Exception("Produto não localizado.", 404);

            }

            // Verifica se calcula o custo médio
            if ($this->obj->averageCost) {

                $averageCost = $this->product->averageCostCalc($product->cost, $product->stock, $this->obj->cost, $this->obj->quantity);

            } else {

                $averageCost = $this->obj->cost;

            }

            // Monta objeto do produto
            $this->product->setCode($this->obj->productCode);
            $this->product->setCost($averageCost);
            $this->productDao->costUp($this->product);

            $this->stockHandling->setCost($this->obj->cost);
            $this->stockHandling->setOldCost($product->cost);

        }

        // Monta objeto
        $this->stockHandling->setProductCode($this->obj->productCode);
        $this->stockHandling->setHistory(!empty($this->obj->history) ? $this->obj->history : null);
        $this->stockHandling->setQuantity($this->obj->type === 1 ? abs($this->obj->quantity) : -abs($this->obj->quantity));
        $this->stockHandling->setType($this->obj->type);
        $this->stockHandlingDao->create($this->stockHandling);

        // Renderização da view
        view(201);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        // Verifica filtro e monta objeto
        $this->stockHandlingFilter->setPage(!empty($data['page']) ? $data['page'] : null);
    
        // Monta objeto
        $this->stockHandlingFilter->setProductCode($data['productCode']);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->stockHandlingDao->read($this->stockHandlingFilter) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "salesCode" => (int) $line->saleCode,
                "history" => $line->history,
                "type" => (int) $line->type,
                "date" =>  dateJson($line->date),
                "quantity" => (float) $line->quantity,
                "cost" => $this->token->getAdmin() ? round($line->cost, 2) : 0,
                "oldCost" => $this->token->getAdmin() ? round($line->oldCost, 2) : 0
            ];

        }

        // Renderização da view
        view(200, $list);
    
    }

    /**
     * Deleta um registro
     * @param array $data
     */
    public function delete(array $data): void {
    
        // Monta objeto
        $this->stockHandling->setCode($data['code']);
        $this->stockHandlingDao->delete($this->stockHandling);

        // Renderização da view
        view(204);
    
    }
    
}
