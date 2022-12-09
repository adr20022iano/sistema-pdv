<?php

namespace Source\Models\PDV\CashBook;


class CashBookReport {

    private array $categoryCode;
    private string $startDate;
    private string $endDate;
    private ?array $saleCodeNotIn = null;

    /**
     * @return array
     */
    public function getCategoryCode(): array {
        return $this->categoryCode;
    }

    /**
     * @param array $categoryCode
     */
    public function setCategoryCode(array $categoryCode): void {
        $this->categoryCode = $categoryCode;
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

    /**
     * @return array|null
     */
    public function getSaleCodeNotIn(): ?array {
        return $this->saleCodeNotIn;
    }

    /**
     * @param array|null $saleCodeNotIn
     */
    public function setSaleCodeNotIn(?array $saleCodeNotIn): void {
        $this->saleCodeNotIn = $saleCodeNotIn;
    }

}
