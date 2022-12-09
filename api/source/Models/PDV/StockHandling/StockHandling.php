<?php

namespace Source\Models\PDV\StockHandling;

class StockHandling {

    private int $code;
    private int $productCode;
    private string $date;
    private ?string $history = null;
    private float $quantity;
    private int $type;
    private ?int $saleCode = null;
    private ?float $saleValue = 0;
    private ?float $cost = 0;
    private ?float $oldCost = 0;

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
    public function getProductCode(): ?int {
        return $this->productCode;
    }

    /**
     * @param int $productCode
     */
    public function setProductCode(int $productCode): void {
        $this->productCode = $productCode;
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
     * @return string|null
     */
    public function getHistory(): ?string {
        return $this->history;
    }

    /**
     * @param string|null $history
     */
    public function setHistory(?string $history): void {
        $this->history = $history;
    }

    /**
     * @return float|null
     */
    public function getQuantity(): ?float {
        return $this->quantity;
    }

    /**
     * @param float $quantity
     */
    public function setQuantity(float $quantity): void {
        $this->quantity = $quantity;
    }

    /**
     * @return int|null
     */
    public function getType(): ?int {
        return $this->type;
    }

    /**
     * @param int $type
     */
    public function setType(int $type): void {
        $this->type = $type;
    }

    /**
     * @return int|null
     */
    public function getSaleCode(): ?int {
        return $this->saleCode;
    }

    /**
     * @return float|int|null
     */
    public function getSaleValue(): float|int|null {
        return $this->saleValue;
    }

    /**
     * @return float|int|null
     */
    public function getCost(): float|int|null {
        return $this->cost;
    }

    /**
     * @param float|int|null $cost
     */
    public function setCost(float|int|null $cost): void {
        $this->cost = $cost;
    }

    /**
     * @return float|int|null
     */
    public function getOldCost(): float|int|null {
        return $this->oldCost;
    }

    /**
     * @param float|int|null $oldCost
     */
    public function setOldCost(float|int|null $oldCost): void {
        $this->oldCost = $oldCost;
    }

}
