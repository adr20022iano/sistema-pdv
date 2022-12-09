<?php

namespace Source\Models\PDV\SalePayment;

class SalePaymentReport {

    private ?int $customerCode = null;
    private ?int $type = null;
    private string $startDate;
    private string $endDate;

    /**
     * @return int|null
     */
    public function getCustomerCode(): ?int {
        return $this->customerCode;
    }

    /**
     * @param int|null $customerCode
     */
    public function setCustomerCode(?int $customerCode): void {
        $this->customerCode = $customerCode;
    }

    /**
     * @return int|null
     */
    public function getType(): ?int {
        return $this->type;
    }

    /**
     * @param int|null $type
     */
    public function setType(?int $type): void {
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
