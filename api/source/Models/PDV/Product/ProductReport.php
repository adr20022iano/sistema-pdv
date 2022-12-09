<?php

namespace Source\Models\PDV\Product;

use Exception;
use Source\Models\PDV\Product\Enum\CatalogSale;
use Source\Models\PDV\Product\Enum\ReportOrderType;
use Source\Models\PDV\Product\Enum\Sale;

class ProductReport {

    private ?int $orderBy = 0;
    private ?bool $orderDesc = false;
    private ?int $stockFilter = null;
    private ?bool $stockFilterAsc = false;
    private ?array $categoryCode = null;
    private ?int $catalogSale = null;
    private ?int $sale = null;

    /**
     * @return int|null
     */
    public function getOrderBy(): ?int {
        return $this->orderBy;
    }

    /**
     * @param int|null $orderBy
     * @throws Exception
     */
    public function setOrderBy(?int $orderBy): void {

        if (!ReportOrderType::tryFrom($orderBy)) {

            throw new Exception("O tipo da ordem é inválida.", 400);

        } else {

            $this->orderBy = $orderBy;

        }

    }

    /**
     * @return bool|null
     */
    public function getOrderDesc(): ?bool {
        return $this->orderDesc;
    }

    /**
     * @param bool|null $orderDesc
     */
    public function setOrderDesc(?bool $orderDesc): void {
        $this->orderDesc = $orderDesc;
    }

    /**
     * @return array|null
     */
    public function getCategoryCode(): ?array {
        return $this->categoryCode;
    }

    /**
     * @param array|null $categoryCode
     */
    public function setCategoryCode(?array $categoryCode): void {
        $this->categoryCode = $categoryCode;
    }

    /**
     * @return int|null
     */
    public function getStockFilter(): ?int {
        return $this->stockFilter;
    }

    /**
     * @param int|null $stockFilter
     */
    public function setStockFilter(?int $stockFilter): void {
        $this->stockFilter = $stockFilter;
    }

    /**
     * @return bool|null
     */
    public function getStockFilterAsc(): ?bool {
        return $this->stockFilterAsc;
    }

    /**
     * @param bool|null $stockFilterAsc
     */
    public function setStockFilterAsc(?bool $stockFilterAsc): void {
        $this->stockFilterAsc = $stockFilterAsc;
    }

    /**
     * @return int|null
     */
    public function getCatalogSale(): ?int {
        return $this->catalogSale;
    }

    /**
     * @param int|null $catalogSale
     * @throws Exception
     */
    public function setCatalogSale(?int $catalogSale): void {

        if (!CatalogSale::tryFrom($catalogSale)) {

            throw new Exception("O tipo de filtro é inválido para o catálogo.", 400);

        } else {

            $this->catalogSale = $catalogSale;

        }

    }

    /**
     * @return int|null
     */
    public function getSale(): ?int {
        return $this->sale;
    }

    /**
     * @param int|null $sale
     * @throws Exception
     */
    public function setSale(?int $sale): void {

        if (!Sale::tryFrom($sale)) {

            throw new Exception("O tipo de filtro é inválido para o produto.", 400);

        } else {

            $this->sale = $sale;

        }

    }

}
