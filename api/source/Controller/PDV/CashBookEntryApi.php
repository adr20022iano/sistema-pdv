<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\CashBookEntry\CashBookEntry;
use Source\Models\PDV\CashBookEntry\CashBookEntryDao;

class CashBookEntryApi {

    private Token $token;
    private ?object $obj;
    private CashBookEntry $cashBookEntry;
    private CashBookEntryDao $cashBookEntryDao;

    /**
     * cashBookEntryApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->cashBookEntry = new CashBookEntry();
        $this->cashBookEntryDao = new CashBookEntryDao($this->token->getUserName());

    }

    /**
     * @throws Exception
     */
    public function create(): void {

        // Verifica se informou uma categoria
        if (!empty($this->obj->categoryCode)) {

            // Verifica se informou uma venda
            if ($this->obj->categoryCode === 1) {

                throw new Exception("Não é possível realizar um lançamento manual na categoria de vendas.", 400);

            }

            $this->cashBookEntry->setCategoryCode($this->obj->categoryCode);

        }

        // Monta objeto
        $this->cashBookEntry->setValue($this->obj->value);
        $this->cashBookEntry->setHistory($this->obj->history);
        $this->cashBookEntryDao->create($this->cashBookEntry);

        // Renderização da view
        view(201,["code" => $this->cashBookEntry->getCode()]);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function readAll(array $data): void {

        // Monta objeto
        $this->cashBookEntry->setDate($data['date']);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->cashBookEntryDao->readAll($this->cashBookEntry) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "category" => $line->categoryName,
                "value" => round($line->value,2),
                "date" => dateJson($line->date),
                "history" => $line->history
            ];

        }

        // Renderização da view
        view(200, [
            "balance" => $this->cashBookEntryDao->readBalance(),
            "list" => $list
        ]);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {
            trueExceptionAccess();
        }

        // Monta objeto
        $this->cashBookEntry->setCode($data['code']);
        $this->cashBookEntryDao->delete($this->cashBookEntry);

        // Renderização da view
        view(204);
    
    }

}
