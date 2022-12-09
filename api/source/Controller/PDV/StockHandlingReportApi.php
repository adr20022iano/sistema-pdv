<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\StockHandling\StockHandlingReport;
use Source\Models\PDV\StockHandling\StockHandlingReportDao;

class StockHandlingReportApi {

    private Token $token;
    private ?object $obj;
    private StockHandlingReport $stockHandlingReport;
    private StockHandlingReportDao $stockHandlingReportDao;
    protected int $type = 2;

    /**
     * StockHandlingReportApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->stockHandlingReport = new StockHandlingReport();
        $this->stockHandlingReportDao = new StockHandlingReportDao($this->token->getUserName(), $this->type);

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
        $this->stockHandlingReport->setType($this->obj->type);
        $this->stockHandlingReport->setStartDate($this->obj->startDate);
        $this->stockHandlingReport->setEndDate($this->obj->endDate);

        // Verifica se filtra por produto
        if (!empty($this->obj->productCode)) {
            $this->stockHandlingReport->setProductCode($this->obj->productCode);
        }

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->stockHandlingReportDao->read($this->stockHandlingReport) as $line) {

            // Verifica o tipo da movimentação
            $type = match ((int) $line->type) {
                1 => "Entrada",
                2 => "Saída",
                3 => "Perda",
                4 => "Venda",
                5 => "Produção",
                6 => "Transferência",
            };

            $list[] = [
                "date" => dateJson($line->date),
                "history" => $line->history,
                "quantity" => round($line->quantity, 2)." ".$line->unit,
                "type" => $type,
                "code" => $line->productCode,
                "name" => $line->productName,
                "cost" => (float) $line->cost,
                "oldCost" => (float) $line->oldCost,
                "saleValue" => (float) $line->saleValue
            ];

        }

        // Renderização da view
        view(200, [
            "data" => [
                "total" => round(array_sum(array_column($list, 'quantity')), 2),
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

        $item['date'] = formatBrazilianDate($item['date'], true);
        $item['cost'] = formatCurrency($item['cost']);
        $item['oldCost'] = formatCurrency($item['oldCost']);
        $item['saleValue'] = formatCurrency($item['saleValue']);

        return $item;

    }

}
