<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\ProductCategory\ProductCategory;
use Source\Models\PDV\ProductCategory\ProductCategoryDao;

class ProductCategoryApi {

    protected Token $token;
    protected ?object $obj;
    protected ProductCategory $productCategory;
    protected ProductCategoryDao $productCategoryDao;
    protected int $type = 2;

    /**
     * productCategoryApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->productCategory = new ProductCategory();
        $this->productCategoryDao = new ProductCategoryDao($this->token->getUserName(), $this->type);

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
    
        $this->productCategoryDao->create($this->setData());

        // Renderização da view
        view(201,["code" => $this->productCategory->getCode()]);

    }

    /**
     */
    public function read(): void {
    
        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->productCategoryDao->read() as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "favorite" => (bool) $line->favorite
            ];

        }

        // Renderização da view
        view(200, $list);
    
    }

    /**
     * @throws Exception
     */
    public function update(): void {
    
        $this->productCategory->setCode($this->obj->code);
        $this->productCategoryDao->update($this->setData());

        // Renderização da view
        view(204);
    
    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {
    
        // Monta objeto
        $this->productCategory->setCode($data['code']);
        $this->productCategoryDao->delete($this->productCategory);

        // Renderização da view
        view(204);
    
    }

    /**
     * @return ProductCategory
     * @throws Exception
     */
    private function setData(): ProductCategory {

        // Monta objeto
        $this->productCategory->setName($this->obj->name);

        if (!empty($this->obj->favorite)) {
            $this->productCategory->setFavorite($this->obj->favorite);
        }

        return $this->productCategory;

    }
    
}
