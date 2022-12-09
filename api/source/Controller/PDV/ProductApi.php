<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\ImageBase64;
use Source\Core\Token;
use Source\Models\PDV\Product\Product;
use Source\Models\PDV\Product\ProductDao;
use Source\Models\PDV\Product\ProductFilter;
use Source\Models\PDV\StockHandling\StockHandling;
use Source\Models\PDV\StockHandling\StockHandlingDao;

class ProductApi {

    protected Token $token;
    protected ?object $obj;
    protected Product $product;
    protected ProductFilter $productFilter;
    protected ProductDao $productDao;
    protected ImageBase64 $images;
    protected StockHandling $stockHandling;
    protected StockHandlingDao $stockHandlingDao;
    protected int $type = 2;

    /**
     * productApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->product = new Product();
        $this->productFilter = new ProductFilter();
        $this->productDao = new ProductDao($this->token->getUserName(), $this->type);
        $this->stockHandling = new StockHandling();
        $this->stockHandlingDao = new StockHandlingDao($this->token->getUserName(), $this->type);

        // Verifica se é admin
        // E se o método nao é do tipo get
        if ((!$this->token->getAdmin()) and ($_SERVER['REQUEST_METHOD'] !== "GET")) {
            trueExceptionAccess();
        }

        // Configuração das imagens
        $this->images = new ImageBase64($this->token->getFolder()."/products", $this->product->getImagesArray());

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        $this->duplicity();

        $this->productDao->create($this->setData());

        // Verifica se informou quantidade de estoque
        if ((!empty($this->obj->stock)) and ($this->obj->stock > 0)) {

            // Monta objeto
            $this->stockHandling->setProductCode($this->product->getCode());
            $this->stockHandling->setHistory("Produto cadastrado");
            $this->stockHandling->setQuantity($this->obj->stock);
            $this->stockHandling->setType(1);
            $this->stockHandlingDao->create($this->stockHandling);

        }

        $this->uploadImage();

        // Renderização da view
        view(201,["code" => $this->product->getCode()]);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        // Verifica se filtra por código de barras
        if ((int) $data['type'] === 1) {

            // Validações
            testBarCode($data['code'], true);

            // Verifica se o código é de controle interno
            if ($data['code'][0] === '2') {

                // Recupera dados a partir do código de barras
                $productCode = substr($data['code'], 1, -6);
                $quantity = substr_replace(substr($data['code'], 7, -1), '.',-3,-3);

                $code = ltrim($productCode, "0");
                $type = 0;

            } else {

                // Dados
                $quantity = 1;
                
                // Monta objeto para consulta
                $code =  $data['code'];
                $type = 1;

            }

            // Verifica filtro e monta objeto
            $this->productFilter->setTypeCode($type);
            $this->productFilter->setCode($code);

            // Monta objeto para consulta
            $line = $this->productDao->read($this->productFilter);

            // Verifica se tem resultado 
            if (empty($line)) {
                throw new Exception("Produto não encontrado.", 404);
            }

            // Monta array
            $list = [
                "code" => (int) $line->code,
                "categoryName" => $line->categoryName,
                "name" => $line->name,
                "unit" => $line->unit,
                "location" => $line->location,
                "barCode" => $line->barCode,
                "value" => round($line->value,2),
                "quantity" => (float) $quantity,
                "image" => $this->images->query($line->code)
            ];

        } else {

            // Verifica filtro e monta objeto
            $this->productFilter->setTypeCode($data['type']);
            $this->productFilter->setCode($data['code']);

            // Monta objeto para consulta
            $line = $this->productDao->read($this->productFilter);

            // Verifica se tem resultado 
            if (empty($line)) {
                throw new Exception("Produto não encontrado.", 404);
            }

            // Monta array
            $list = [
                "barCode" => $line->barCode,
                "name" => $line->name,
                "categoryName" => $line->categoryName,
                "categoryCode" => (int) $line->categoryCode,
                "stock" => (float) $line->stock,
                "value" => round($line->value, 2),
                "cost" => round($line->cost, 2),
                "scaleDate" => (int) $line->scaleDate,
                "shelfLife" => $line->shelfLife,
                "unit" => $line->unit,
                "production" => (boolean) $line->production,
                "sale" => (boolean) $line->sale,
                "location" => $line->location,
                "catalogSale" => (boolean) $line->catalogSale,
                "details" => $line->details,
                "catalogDetails" => $line->catalogDetails,
                "externalSaleValue" => !empty($line->externalSaleValue) ? round($line->externalSaleValue, 2) : round($line->value,2),
                "image" => $this->images->query($line->code)
            ];

        }

        // Renderização da view
        view(200, $list);

    }

    /**
     * @throws Exception
     */
    public function readAll(?array $unset = null): void {

        // Verifica filtro por página
        if (!empty($_GET['page'])) {
            $this->productFilter->setPage($_GET['page']);
        }

        // Verifica filtro por nome
        if (!empty($_GET['name'])) {
            $this->productFilter->setName($_GET['name']);
        }

        // Verifica filtro por categoria
        if (!empty($_GET['categoryCode'])) {
            $this->productFilter->setCategoryCode($_GET['categoryCode']);
        }

        // Verifica filtro por produção
        if (!empty($_GET['production'])) {
            $this->productFilter->setProduction($_GET['production']);
        }

        // Verifica filtro por disponibilidade de venda
        if (!empty($_GET['sale'])) {
            $this->productFilter->setSale($_GET['sale']);
        }

        // Verifica filtro por catálogo
        if (!empty($_GET['catalogSale'])) {
            $this->productFilter->setCatalogSale($_GET['catalogSale']);
        }

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->productDao->readAll($this->productFilter) as $line) {

            // Valor de venda externa
            $externalSaleValue = $line->externalSaleValue > 0 ? round($line->externalSaleValue, 2) : round($line->value,2);

            $data = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "categoryName" => $line->categoryName,
                "stock" => (float) $line->calculatedStock,
                "compositionQuantity" => (float) $line->compositionQuantity,
                "compositionUnit" => $line->compositionUnit,
                "unit" => $line->unit,
                "value" => $this->type === 7 ? $externalSaleValue : round($line->value,2),
                "location" => $line->location,
                "barCode" => !empty($line->barCode) ? $line->barCode : null,
                "cost" => $this->token->getAdmin() ? round($line->calculatedCost,2) : null,
                "externalSaleValue" => $externalSaleValue,
                "catalogDetails" => $line->catalogDetails,
                "image" => $this->images->query($line->code)
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
        view(200, $this->productFilter->optimizeFilter($list, $this->productFilter->getName()));

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        $this->product->setCode($this->obj->code);
        $this->productDao->update($this->setData());

       $this->uploadImage();

        // Renderização da view
        view(204);
    
    }

    /**
     * Deleta um registro
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {
    
        // Monta objeto
        $this->product->setCode($data['code']);
        $this->productDao->delete($this->product);

        $this->images->delete($this->product->getCode());

        // Renderização da view
        view(204);
    
    }

    /**
     * @return Product
     * @throws Exception
     */
    protected function setData(): Product {

        // Monta objeto
        $this->product->setName($this->obj->name);
        $this->product->setUnit($this->obj->unit);
        $this->product->setProduction($this->obj->production);
        $this->product->setSale($this->obj->sale);

        if (!empty($this->obj->value)) {
            $this->product->setValue($this->obj->value);
        }

        if (!empty($this->obj->categoryCode)) {
            $this->product->setCategoryCode($this->obj->categoryCode);
        }

        if (!empty($this->obj->barCode)) {
            $this->product->setBarCode(testBarCode($this->obj->barCode, false));
        }

        if (!empty($this->obj->cost)) {
            $this->product->setCost($this->obj->cost);
        }

        if (!empty($this->obj->scaleDate)) {
            $this->product->setScaleDate($this->obj->scaleDate);
        }

        if (!empty($this->obj->shelfLife)) {
            $this->product->setShelfLife($this->obj->shelfLife);
        }

        if (!empty($this->obj->location)) {
            $this->product->setLocation($this->obj->location);
        }

        if (!empty($this->obj->catalogSale)) {
            $this->product->setCatalogSale($this->obj->catalogSale);
        }

        if (!empty($this->obj->details)) {
            $this->product->setDetails($this->obj->details);
        }

        if (!empty($this->obj->catalogDetails)) {
            $this->product->setCatalogDetails($this->obj->catalogDetails);
        }

        if (!empty($this->obj->externalSaleValue)) {
            $this->product->setExternalSaleValue($this->obj->externalSaleValue);
        }

        return $this->product;

    }

    /**
     * Faz o envio da imagem
     * @throws Exception
     */
    protected function uploadImage(): void {

        // Verifica se enviou a imagem
        if (!empty($this->obj->image)) {

            // Verifica se deleta a imagem
            if ($this->obj->image === "delete") {

                $this->images->delete($this->product->getCode());

            } else {

                $this->images->upload($this->obj->image, $this->product->getCode());

            }

        }

    }

    /**
     * Consulta se nome já foi cadastrado
     * @throws Exception
     */
    protected function duplicity(): void {

        // Verifica nome
        if (!empty($this->obj->name)) {

            $this->productFilter->setExactName($this->obj->name);

            if (!empty($this->obj->code)) {
                $this->productFilter->setNotCode($this->obj->code);
            }

            if (count($this->productDao->readAll($this->productFilter)) > 0) {

                throw new Exception("Já existe um produto cadastrado com esse nome.", 409);

            }

        }

    }

}
