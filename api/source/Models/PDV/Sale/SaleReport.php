<?php

namespace Source\Models\PDV\Sale;

use Exception;
use Source\Models\PDV\Sale\Enum\PaymentStatus;

class SaleReport {

    private ?int $sellerCode = null;
    private ?int $customerCode = null;
    private ?int $paymentStatus = null;
    private string $startDate;
    private string $endDate;
    private ?int $productCode = null;

    /**
     * @return int|null
     */
    public function getSellerCode(): ?int {
        return $this->sellerCode;
    }

    /**
     * @param int|null $sellerCode
     */
    public function setSellerCode(?int $sellerCode): void {
        $this->sellerCode = $sellerCode;
    }

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
     * @return int|null
     */
    public function getPaymentStatus(): ?int {
        return $this->paymentStatus;
    }

    /**
     * @param int|null $paymentStatus
     * @throws Exception
     */
    public function setPaymentStatus(?int $paymentStatus): void {

        if (!PaymentStatus::tryFrom($paymentStatus)) {

            throw new Exception("O tipo de pagamento é inválido.", 400);

        } else {

            $this->paymentStatus = $paymentStatus;

        }

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
