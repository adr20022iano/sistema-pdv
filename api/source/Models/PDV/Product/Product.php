<?php

namespace Source\Models\PDV\Product;

use Exception;

class Product {

    private int $code;
    private ?string $barCode = null;
    private string $name;
    private ?int $categoryCode = null;
    private ?float $value = 0;
    private ?float $cost = 0;
    private ?int $scaleDate = null;
    private ?string $shelfLife = null;
    private string $unit;
    private bool $production;
    private bool $sale;
    private ?string $location = null;
    private ?bool $catalogSale = false;
    private ?string $details = null;
    private ?string $catalogDetails = null;
    private ?float $externalSaleValue = null;

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
     * @return string|null
     */
    public function getBarCode(): ?string {
        return $this->barCode;
    }

    /**
     * @param string|null $barCode
     */
    public function setBarCode(?string $barCode): void {
        $this->barCode = $barCode;
    }

    /**
     * @return string|null
     */
    public function getName(): ?string {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name): void {
        $this->name = $name;
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
     * @return float|int|null
     */
    public function getValue(): float|int|null {
        return $this->value;
    }

    /**
     * @param float|int|null $value
     */
    public function setValue(float|int|null $value): void {
        $this->value = $value;
    }

    /**
     * @return int|null
     */
    public function getScaleDate(): ?int {
        return $this->scaleDate;
    }

    /**
     * @param int|null $scaleDate
     */
    public function setScaleDate(?int $scaleDate): void {
        $this->scaleDate = $scaleDate;
    }

    /**
     * @return string|null
     */
    public function getShelfLife(): ?string {
        return $this->shelfLife;
    }

    /**
     * @param string|null $shelfLife
     * @throws Exception
     */
    public function setShelfLife(?string $shelfLife): void {
        $this->shelfLife = dateJson($shelfLife);
    }

    /**
     * @return string|null
     */
    public function getUnit(): ?string {
        return $this->unit;
    }

    /**
     * @param string $unit
     */
    public function setUnit(string $unit): void {
        $this->unit = $unit;
    }

    /**
     * @return bool|null
     */
    public function getProduction(): ?bool {
        return $this->production;
    }

    /**
     * @param bool $production
     */
    public function setProduction(bool $production): void {
        $this->production = $production;
    }

    /**
     * @return bool|null
     */
    public function getSale(): ?bool {
        return $this->sale;
    }

    /**
     * @param bool $sale
     */
    public function setSale(bool $sale): void {
        $this->sale = $sale;
    }

    /**
     * @return string|null
     */
    public function getLocation(): ?string {
        return $this->location;
    }

    /**
     * @param string|null $location
     */
    public function setLocation(?string $location): void {
        $this->location = $location;
    }

    /**
     * @return float
     */
    public function getCost(): float {
        return $this->cost;
    }

    /**
     * @param float
     */
    public function setCost(float $cost): void {
        $this->cost = $cost;
    }

    /**
     * @return bool|null
     */
    public function getCatalogSale(): ?bool {
        return $this->catalogSale;
    }

    /**
     * @param bool|null $catalogSale
     */
    public function setCatalogSale(?bool $catalogSale): void {
        $this->catalogSale = $catalogSale;
    }

    /**
     * Calcula o custo médio
     * @param float $currentCost
     * @param float $currentStock
     * @param float $newCost
     * @param float $newStock
     * @return float
     */
    public function averageCostCalc(float $currentCost, float $currentStock, float $newCost, float $newStock): float {

        // Verifica se tem quantidade
        if (($currentCost > 0) and ($currentStock > 0))  {

            // Calcula custo médio do produto
            $averageCostCurrent = $currentStock * $currentCost;
            $averageCostNew = $newStock * $newCost;

            $valueCalc = $averageCostCurrent + $averageCostNew;
            $stockCalc = $currentStock + $newStock;

            // Verifica se tem estoque
            if (empty($stockCalc)) {
                
                return $currentCost;
                
            } else {
                
                return abs($valueCalc / $stockCalc);
                
            }

        } else {

            return $newCost;

        }

    }

    /**
     * @return string|null
     */
    public function getDetails(): ?string {
        return $this->details;
    }

    /**
     * @param string|null $details
     */
    public function setDetails(?string $details): void {
        $this->details = $details;
    }

    /**
     * @return string|null
     */
    public function getCatalogDetails(): ?string {
        return $this->catalogDetails;
    }

    /**
     * @param string|null $catalogDetails
     */
    public function setCatalogDetails(?string $catalogDetails): void {
        $this->catalogDetails = $catalogDetails;
    }

    /**
     * @return float|null
     */
    public function getExternalSaleValue(): ?float {
        return $this->externalSaleValue;
    }

    /**
     * @param float|int|null $externalSaleValue
     */
    public function setExternalSaleValue(float|int|null $externalSaleValue): void {
        $this->externalSaleValue = $externalSaleValue;
    }

    /**
     * @return array
     */
    public function getImagesArray(): array {
        return [
            ["name" => "m", "width" => 50],
            ["name" => "v", "width" => 320],
            ["name" => "f", "width" => null]
        ];
    }

}
