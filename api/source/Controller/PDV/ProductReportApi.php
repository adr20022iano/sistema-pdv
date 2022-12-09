<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Product\ProductReportDao;
use Source\Models\PDV\Product\ProductReport;

class ProductReportApi {

    private Token $token;
    private ?object $obj;
    private ProductReport $productReport;
    private ProductReportDao $productReportDao;
    protected int $type = 2;

    /**
     * productApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->productReport = new ProductReport();
        $this->productReportDao = new ProductReportDao($this->token->getUserName(), $this->type);

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
        if (isset($this->obj->categoryCode)) {
            $this->productReport->setCategoryCode($this->obj->categoryCode);
        }

        if (isset($this->obj->stockFilter)) {
            $this->productReport->setStockFilter($this->obj->stockFilter);
        }

        if (!empty($this->obj->stockFilterAsc)) {
            $this->productReport->setStockFilterAsc($this->obj->stockFilterAsc);
        }

        if (!empty($this->obj->orderBy)) {
            $this->productReport->setOrderBy($this->obj->orderBy);
        }

        if (!empty($this->obj->orderDesc)) {
            $this->productReport->setOrderDesc(true);
        }

        if (!empty($this->obj->catalogSale)) {
            $this->productReport->setCatalogSale($this->obj->catalogSale);
        }

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->productReportDao->read($this->productReport) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "unit" => $line->unit,
                "categoryName" => $line->categoryName,
                "stock" => (float) $line->stock,
                "cost" => round($line->cost,2),
                "value" => round($line->value,2),
                "sumCost" => round($line->stock * $line->cost,2),
                "sumValue" => round($line->stock * $line->value,2)
            ];

        }

        // Calcula totais filtrando somente os valores positivos
        $totalSaleValue = array_sum(array_filter(array_column($list, 'sumValue'), "filterPositiveValue"));
        $totalCostValue = array_sum(array_filter(array_column($list, 'sumCost'), "filterPositiveValue"));
        $itemsTotal = array_sum(array_filter(array_column($list, 'stock'), "filterPositiveValue"));

        // Renderização da view
        view(200, [
            "data" => [
                "totalSaleValue" => formatCurrency($totalSaleValue),
                "totalCostValue" => formatCurrency($totalCostValue),
                "profitValue" => formatCurrency($totalSaleValue - $totalCostValue),
                "profitMargin" => round(margin($totalSaleValue, $totalCostValue), 2)." %",
                "profitMarkup" => round(markup($totalSaleValue, $totalCostValue), 2)." %",
                "itemsTotal" => $itemsTotal
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

        $item['cost'] = formatCurrency($item['cost']);
        $item['value'] = formatCurrency($item['value']);
        $item['sumCost'] = formatCurrency($item['sumCost']);
        $item['sumValue'] = formatCurrency($item['sumValue']);
        $item['stock'] = round($item['stock'], 2)." ".$item['unit'];

        // Remove
        unset($item['unit']);

        return $item;

    }

}
