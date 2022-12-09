<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Seller\Seller;
use Source\Models\PDV\Seller\SellerDao;

class SellerApi {

    private Token $token;
    private ?object $obj;
    private Seller $seller;
    private SellerDao $sellerDao;

    /**
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->seller = new Seller();
        $this->sellerDao = new SellerDao($this->token->getUserName());

        // Verifica se é admin. E se o método nao é do tipo get
        if ((!$this->token->getAdmin()) and ($_SERVER['REQUEST_METHOD'] !== "GET")) {
            trueExceptionAccess();
        }

    }

    /**
     * @throws Exception
     */
    public function create(): void {
    
        // Monta objeto
        $this->seller->setName($this->obj->name);
        $this->sellerDao->create($this->seller);

        // Renderização da view
        view(201,["code" => $this->seller->getCode()]);

    }
    
    /**
     * Consulta os registros
     */
    public function readAll(): void {
    
        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->sellerDao->readAll() as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "externalSalesCode" => $line->externalSalesCode
            ];

        }

        // Renderização da view
        view(200, $list);
    
    }

    /**
     * @throws Exception
     */
    public function update(): void {
    
        // Monta objeto
        $this->seller->setName($this->obj->name);
        $this->seller->setCode($this->obj->code);
        $this->sellerDao->update($this->seller);

        // Renderização da view
        view(204);
    
    }

    /**
     * @param array $data
     */
    public function delete(array $data): void {
    
        // Monta objeto
        $this->seller->setCode($data['code']);
        $this->sellerDao->delete($this->seller);

        // Renderização da view
        view(204);
    
    }
    
}
