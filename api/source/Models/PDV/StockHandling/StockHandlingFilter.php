<?php


namespace Source\Models\PDV\StockHandling;


class StockHandlingFilter {

    private ?int $page = null;
    private ?int $productCode = null;

    /**
     * @return int|null
     */
    public function getPage(): ?int {
        return $this->page;
    }

    /**
     * @param int|null $page
     */
    public function setPage(?int $page): void {
        $this->page = $page;
    }

    /**
     * @return int|null
     */
    public function getProductCode(): ?int {
        return $this->productCode;
    }

    /**
     * @param int|null $productCode
     */
    public function setProductCode(?int $productCode): void {
        $this->productCode = $productCode;
    }

}
