<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\CashBook\CashBookReport;
use Source\Models\PDV\CashBook\CashBookReportDao;

class CashBookReportApi {

    private Token $token;
    private ?object $obj;
    private CashBookReport $cashBookReport;
    private CashBookReportDao $cashBookReportDao;

    /**
     * CashBookReportApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->cashBookReport = new CashBookReport();
        $this->cashBookReportDao = new CashBookReportDao($this->token->getUserName());

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {
            trueExceptionAccess();
        }

    }

    /**
     * Consulta os registros
     * @throws Exception
     */
    public function read(): void {

        // Verifica filtro e monta objeto
        $this->cashBookReport->setCategoryCode($this->obj->categoryCode);
        $this->cashBookReport->setStartDate($this->obj->startDate);
        $this->cashBookReport->setEndDate($this->obj->endDate);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->cashBookReportDao->read($this->cashBookReport) as $line) {

            $list[] = [
                "code" => $line->code,
                "date" => dateJson($line->date),
                "history" => $line->history,
                "categoryName" => $line->categoryName,
                "value" => round($line->value, 2)
            ];

        }

        // Calcula totais
        $totalValue = array_sum(array_column($list, 'value'));

        // Renderização da view
        view(200, [
            "data" => [
                "totalValue" => formatCurrency($totalValue)
            ],
            "list" => array_map("self::formatting", $list)
        ]);

    }

    /**
     * @param array $item
     * @return array
     * @throws Exception
     */
    static private function formatting(array $item): array {

        $item['value'] = formatCurrency($item['value']);
        $item['date'] = formatBrazilianDate($item['date'], true);

        return $item;

    }

}
