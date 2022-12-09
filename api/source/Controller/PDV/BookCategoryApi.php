<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\BookCategory\BookCategory;
use Source\Models\PDV\BookCategory\BookCategoryDao;

class BookCategoryApi {

    private Token $token;
    private ?object $obj;
    private BookCategory $bookCategory;
    private BookCategoryDao $bookCategoryDao;

    /**
     * bookCategoryApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->bookCategory = new BookCategory();
        $this->bookCategoryDao = new BookCategoryDao($this->token->getUserName());

        // Verifica se é admin. E se o método nao é do tipo get
        if ((!$this->token->getAdmin()) and ($_SERVER['REQUEST_METHOD'] !== "GET")) {
            trueExceptionAccess();
        }

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        $this->bookCategoryDao->create($this->setData());

        // Renderização da view
        view(201,["code" => $this->bookCategory->getCode()]);

    }

    /**
     */
    public function read(): void {

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->bookCategoryDao->read() as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "type" => (int) $line->type
            ];

        }

        // Renderização da view
        view(200, $list);

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        $this->bookCategory->setCode($this->obj->code);
        $this->bookCategoryDao->update($this->setData());

        // Renderização da view
        view(204);
        
    }

    /**
     * @param array $data
     */
    public function delete(array $data): void {

        // Monta objeto
        $this->bookCategory->setCode($data['code']);
        $this->bookCategoryDao->delete($this->bookCategory);

        // Renderização da view
        view(204);
    
    }

    /**
     * @return BookCategory
     * @throws Exception
     */
    private function setData(): BookCategory {

        // Monta objeto
        $this->bookCategory->setName($this->obj->name);
        $this->bookCategory->setType($this->obj->type);

        return $this->bookCategory;

    }

}
