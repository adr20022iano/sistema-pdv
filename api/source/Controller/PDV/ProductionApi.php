<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Production\Production;
use Source\Models\PDV\Production\ProductionDao;

class ProductionApi {

    private Token $token;
    private ?object $obj;
    private Production $production;
    private ProductionDao $productionDao;

    /**
     * productionApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->production = new Production();
        $this->productionDao = new ProductionDao($this->token->getUserName());

        // Verifica se é admin. E se o método nao é do tipo get
        if ((!$this->token->getAdmin()) and ($_SERVER['REQUEST_METHOD'] !== "GET")) {
            trueExceptionAccess();
        }

    }
    
    /**
     */
    public function create(): void {
    
        // Monta objeto
        $this->production->setProductCode($this->obj->productCode);
        $this->production->setComposition($this->obj->composition);
        $this->productionDao->create($this->production);

        // Renderização da view
        view(201);

    }

    /**
     * @param array $data
     */
    public function read(array $data): void {
    
        // Monta objeto
        $this->production->setProductCode($data['productCode']);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->productionDao->read($this->production) as $line) {

            $list[] = [
                "productionCode" => (int) $line->code,
                "productCode" => (int) $line->compositionProductCode,
                "name" => $line->name,
                "unit" => $line->unit,
                "quantity" => (float) $line->quantity,
                "value" => round($line->value,2)
            ];

        }

        // Renderização da view
        view(200, $list);
    
    }
    
}
