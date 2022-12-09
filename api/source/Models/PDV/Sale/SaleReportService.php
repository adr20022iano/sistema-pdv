<?php

namespace Source\Models\PDV\Sale;

use Exception;

class SaleReportService {

    /**
     * @param SaleReport $saleReport
     * @param object $obj
     * @return SaleReport
     */
    public function setFilter(SaleReport $saleReport, object $obj): SaleReport {

        // Verifica filtro e monta objeto
        $saleReport->setStartDate($obj->startDate);
        $saleReport->setEndDate($obj->endDate);

        if (!empty($obj->customerCode)) {
            $saleReport->setCustomerCode($obj->customerCode);
        }

        if (!empty($obj->sellerCode)) {
            $saleReport->setSellerCode($obj->sellerCode);
        }

        if (!empty($obj->productCode)) {
            $saleReport->setProductCode($obj->productCode);
        }

        if (isset($obj->paymentStatus)) {
            $saleReport->setPaymentStatus($obj->paymentStatus);
        }

        return $saleReport;

    }

    /**
     * @param array $array
     * @return array
     */
    public function salePrint(array $array): array {

        return array_map("self::saleFormatting", $array);

    }

    /**
     * @param array $item
     * @return array
     * @throws Exception
     */
    static private function saleFormatting(array $item): array {

        $item['date'] = formatBrazilianDate($item['date'], true);
        $item['value'] = formatCurrency($item['value']);
        $item['discount'] = formatCurrency($item['discount']);
        $item['shipping'] = formatCurrency($item['shipping']);
        $item['productsCost'] = formatCurrency($item['productsCost']);

        // ADD
        $item['profit'] = formatCurrency($item['profitValue'])." • ".round($item['profitMargin'], 2)."% • ".round($item['profitMarkup'], 2)."%";

        // Remove
        unset($item['profitValue']);
        unset($item['profitMargin']);
        unset($item['profitMarkup']);
        unset($item['paidValue']);

        return $item;

    }

    /**
     * @param array $array
     * @return array
     */
    public function productPrint(array $array): array {

        return array_map("self::productFormatting", $array);

    }

    /**
     * @param array $item
     * @return array
     * @throws Exception
     */
    static private function productFormatting(array $item): array {

        $item['value'] = formatCurrency($item['value']);
        $item['cost'] = formatCurrency($item['cost']);
        $item['quantity'] = $item['quantity'] . " " . $item['unit'];

        // ADD
        $item['profit'] = formatCurrency($item['profitValue'])." • ".round($item['profitMargin'], 2)."% • ".round($item['profitMarkup'], 2)."%";

        // Remove
        unset($item['profitValue']);
        unset($item['profitMargin']);
        unset($item['profitMarkup']);
        unset($item['unit']);

        return $item;

    }

}