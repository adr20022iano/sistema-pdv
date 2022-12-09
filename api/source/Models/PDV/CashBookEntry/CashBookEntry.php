<?php

namespace Source\Models\PDV\CashBookEntry;

use Exception;

class CashBookEntry {

    private int $code;
    private ?int $categoryCode = null;
    private float $value;
    private string $date;
    private ?string $history = "";

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
     * @param float $value
     */
    public function setValue(float $value): void {
        $this->value = $value;
    }

    /**
     * @return string|null
     */
    public function getDate(): ?string {
        return $this->date;
    }

    /**
     * @param string $date
     * @throws Exception
     */
    public function setDate(string $date): void {
        $this->date = dateJson($date);
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

}
