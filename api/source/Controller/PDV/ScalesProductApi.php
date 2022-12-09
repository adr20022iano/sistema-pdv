<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use DateTime;
use Exception;
use Source\Core\Token;
use Source\Models\PDV\Product\ScalesProductDao;

class ScalesProductApi {

    private Token $token;
    protected ScalesProductDao $scalesProductDao;

    /**
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        $this->scalesProductDao = new ScalesProductDao($this->token->getUserName());

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {
            trueExceptionAccess();
        }

    }

    /**
     * @throws Exception
     */
    public function read(): void {

        // Inicia variáveis
        $list = [];
        $dueDate = 0;

        // Monta a lista
        foreach ($this->scalesProductDao->read() as $line) {

            // Verifica o tipo de data de validade
            switch ($line->scaleDate) {

                // Exibe a data de validade configurado no cadastro do produto
                case '1':

                    if (empty($line->shelfLife)) {
                        break;
                    }

                    // Intervalo de dias entre 2 datas
                    $firstDate  = new DateTime(date('y-m-d'));
                    $secondDate = DateTime::createFromFormat('y-m-d', $line->shelfLife);
                    $dueDate = max($firstDate->diff($secondDate)->d, 0);

                    break;

                // A data de validade será solicitada pela balança
                case '2':

                    $dueDate = 999;

                    break;

                // A data de validade é calculada com a data atual + 30 dias
                case '3':

                    $dueDate = 30;

                    break;

                // A data de validade é calculada com a data atual + 60 dias
                case '4':

                    $dueDate = 60;

                    break;

                // A data de validade é calculada com a data atual + 90 dias
                case '5':

                    $dueDate = 90;

                    break;

            }

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "value" => (float) $line->value,
                "dueDate" => $dueDate
            ];

        }

        // Renderização da view
        view(200, $list);

    }

}