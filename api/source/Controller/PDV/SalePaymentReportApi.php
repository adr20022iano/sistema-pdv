<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\SalePayment\SalePaymentReport;
use Source\Models\PDV\SalePayment\SalePaymentReportDao;

class SalePaymentReportApi {

    private Token $token;
    private ?object $obj;
    private SalePaymentReport $salePaymentReport;
    private SalePaymentReportDao $salePaymentReportDao;

    /**
     * SalePaymentReportApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->salePaymentReport = new SalePaymentReport();
        $this->salePaymentReportDao = new SalePaymentReportDao($this->token->getUserName());

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
        $this->salePaymentReport->setStartDate($this->obj->startDate);
        $this->salePaymentReport->setEndDate($this->obj->endDate);

        // Verifica se filtro por cliente
        if (isset($this->obj->customerCode)) {
            $this->salePaymentReport->setCustomerCode($this->obj->customerCode);
        }

        // Verifica se filtra por tipo
        if (!empty($this->obj->type)) {
            $this->salePaymentReport->setType($this->obj->type);
        }

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->salePaymentReportDao->read($this->salePaymentReport) as $line) {

            // Verifica o tipo de pagamento
            $type = match ((int) $line->type) {
                1 => "Dinheiro/Cheque",
                2 => "Cartão de Crédito",
                3 => "Cartão de Débito",
                4 => "Outros"
            };

            $list[] = [
                "date" => dateJson($line->date),
                "saleCode" => (int) $line->saleCode,
                "value" => round($line->value,2),
                "customerName" => $line->customerName,
                "type" => $type
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
