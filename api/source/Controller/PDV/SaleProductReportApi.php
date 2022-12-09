<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Source\Models\PDV\Sale\Enum\SaleReportType;
use Source\Models\PDV\Sale\SaleReportDao;

class SaleProductReportApi extends SaleReportApi {

    public function __construct() {

        parent::__construct();

        $this->saleReportDao = new SaleReportDao($this->token->getUserName(), SaleReportType::Products);

    }

    public function read(): void {

        // Verifica filtro e monta objeto
        $this->saleReport = $this->saleReportService->setFilter($this->saleReport, $this->obj);

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->saleReportDao->read($this->saleReport) as $line) {

            $list[] = [
                "code" => (int) $line->productCode,
                "name" => $line->name,
                "barCode" => $line->barCode,
                "unit" => $line->unit,
                "quantity" => (float) $line->quantity,
                "cost" => round( $line->cost,2),
                "value" => round($line->value,2),
                "profitValue" => $line->value - $line->cost,
                "profitMargin" => margin($line->value, $line->cost),
                "profitMarkup" => markup($line->value, $line->cost),
            ];

        }

        // Calcula totais
        $totalSaleValue = array_sum(array_column($list, 'value'));
        $totalProductsCost = array_sum(array_column($list, 'cost'));
        $total = array_sum(array_column($list, 'quantity'));

        // Renderização da view
        view(200, [
            "data" => [
                "totalSaleValue" => formatCurrency($totalSaleValue),
                "totalProductsCost" => formatCurrency($totalProductsCost),
                "total" => $total,
                "profitValue" => formatCurrency($totalSaleValue - $totalProductsCost),
                "profitMargin" => round(margin($totalSaleValue, $totalProductsCost), 2)." %",
                "profitMarkup" => round(markup($totalSaleValue, $totalProductsCost), 2)." %"
            ],
            "list" => $this->saleReportService->productPrint($list)
        ]);

    }

}