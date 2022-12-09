<?php

namespace Source\Models\PDV\StockHandling;

class StockHandlingReport {

    private ?int $productCode = null;
    private array $type;
    private string $startDate;
    private string $endDate;

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

    /**
     * @return array
     */
    public function getType(): array {
        return $this->type;
    }

    /**
     * @param array $type
     */
    public function setType(array $type): void {
        $this->type = $type;
    }

    /**
     * @return string
     */
    public function getStartDate(): string {
        return $this->startDate;
    }

    /**
     * @param string $startDate
     */
    public function setStartDate(string $startDate): void {
        $this->startDate = $startDate;
    }

    /**
     * @return string
     */
    public function getEndDate(): string {
        return $this->endDate;
    }

    /**
     * @param string $endDate
     */
    public function setEndDate(string $endDate): void {
        $this->endDate = $endDate;
    }

}
