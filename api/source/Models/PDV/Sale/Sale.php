<?php

namespace Source\Models\PDV\Sale;

use Exception;

class Sale {

    private int $code;
    private ?int $sellerCode = null;
    private ?int $customerCode = null;
    private ?string $observation = null;
    private string $date;
    private ?float $discount = 0;
    private ?float $saleChange = 0;
    private ?array $products = null;
    private ?float $shipping = 0;
    private ?int $origin = 0;
    private ?bool $locked = false;

    /**
     * @return int
     */
    public function getCode(): int {
        return $this->code;
    }

    /**
     * @param int $code
     */
    public function setCode(int $code): void {
        $this->code = $code;
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
    public function getObservation(): ?string {
        return $this->observation;
    }

    /**
     * @param string|null $observation
     */
    public function setObservation(?string $observation): void {
        $this->observation = $observation;
    }

    /**
     * @return string|null
     */
    public function getDate(): ?string {
        return $this->date;
    }

    /**
     * @param string $date
     */
    public function setDate(string $date): void {
        $this->date = $date;
    }

    /**
     * @return float|null
     */
    public function getDiscount(): float|null {
        return $this->discount;
    }

    /**
     * @param float $discount
     */
    public function setDiscount(float $discount): void {
        $this->discount = $discount;
    }

    /**
     * @return float|int|null
     */
    public function getSaleChange(): float|int|null {
        return $this->saleChange;
    }

    /**
     * @param float|int|null $saleChange
     */
    public function setSaleChange(float|int|null $saleChange): void {
        $this->saleChange = $saleChange;
    }

    /**
     * @return array|null
     */
    public function getProducts(): ?array {
        return $this->products;
    }

    /**
     * @param array|null $products
     */
    public function setProducts(?array $products): void {
        $this->products = $products;
    }

    /**
     * Verifica o valor total dos produtos
     * @param array $products
     * @return float
     */
    public function valueTotalProducts(array $products): float {

        $total = 0;

        foreach ($products as $line) {

            $total += $line->quantity * $line->value;

        }

        return $total;

    }

    /**
     * @return float|int|null
     */
    public function getShipping(): float|int|null {
        return $this->shipping;
    }

    /**
     * @param float|int|null $shipping
     */
    public function setShipping(float|int|null $shipping): void {
        $this->shipping = $shipping;
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
     * @return bool|null
     */
    public function getLocked(): ?bool {
        return $this->locked;
    }

    /**
     * @param bool|null $locked
     */
    public function setLocked(?bool $locked): void {
        $this->locked = $locked;
    }

}
