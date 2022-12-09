<?php


namespace Source\Models\PDV\Sale;


class SaleFilter {

    private ?int $code = null;
    private ?int $page = null;
    private ?bool $noPagination = false;
    private ?int $paymentStatus = null;
    private ?string $date = null;
    private ?int $customerCode = null;
    private ?string $codeObservation = null;
    private ?int $origin = null;
    private ?int $locked = null;
    private ?int $sellerCode = null;
    private ?array $codes = null;
    private ?int $categoryCode = null;
    private ?float $value = null;

    /**
     * @return int|null
     */
    public function getPage(): ?int {
        return $this->page;
    }

    /**
     * @return int|null
     */
    public function getCode(): ?int {
        return $this->code;
    }

    /**
     * @param int|null $code
     */
    public function setCode(?int $code): void {
        $this->code = $code;
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
    public function getPaymentStatus(): ?int {
        return $this->paymentStatus;
    }

    /**
     * @param int|null $paymentStatus
     */
    public function setPaymentStatus(?int $paymentStatus): void {
        $this->paymentStatus = $paymentStatus;
    }

    /**
     * @return string|null
     */
    public function getDate(): ?string {
        return $this->date;
    }

    /**
     * @param string|null $date
     */
    public function setDate(?string $date): void {
        $this->date = $date;
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
     * @return string|null
     */
    public function getCodeObservation(): ?string {
        return $this->codeObservation;
    }

    /**
     * @param string|null $codeObservation
     */
    public function setCodeObservation(?string $codeObservation): void {
        $this->codeObservation = $codeObservation;
    }

    /**
     * @return int|null
     */
    public function getOrigin(): ?int {
        return $this->origin;
    }

    /**
     * @param int|null $origin
     */
    public function setOrigin(?int $origin): void {
        $this->origin = $origin;
    }

    /**
     * @return int|null
     */
    public function getLocked(): ?int {
        return $this->locked;
    }

    /**
     * @param int|null $locked
     */
    public function setLocked(?int $locked): void {
        $this->locked = $locked;
    }

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
     * @return bool|null
     */
    public function getNoPagination(): ?bool {
        return $this->noPagination;
    }

    /**
     * @param bool|null $noPagination
     */
    public function setNoPagination(?bool $noPagination): void {
        $this->noPagination = $noPagination;
    }

    /**
     * @return array|null
     */
    public function getCodes(): ?array {
        return $this->codes;
    }

    /**
     * @param array|null $codes
     */
    public function setCodes(?array $codes): void {
        $this->codes = $codes;
    }

    /**
     * @return int|null
     */
    public function getCategoryCode(): ?int {
        return $this->categoryCode;
    }

    /**
     * @param int|null $categoryCode
     */
    public function setCategoryCode(?int $categoryCode): void {
        $this->categoryCode = $categoryCode;
    }

    /**
     * @return float|null
     */
    public function getValue(): ?float {
        return $this->value;
    }

    /**
     * @param float|null $value
     */
    public function setValue(?float $value): void {
        $this->value = $value;
    }

}
