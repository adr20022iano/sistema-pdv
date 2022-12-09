<?php

namespace Source\Models\PDV\SalePayment;

use Exception;

class SalePayment {

    private int $code;
    private int $saleCode;
    private float $value;
    private int $type;

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
    public function getSaleCode(): ?int {
        return $this->saleCode;
    }

    /**
     * @param int $saleCode
     */
    public function setSaleCode(int $saleCode): void {
        $this->saleCode = $saleCode;
    }

    /**
     * @return float|null
     */
    public function getValue(): ?float {
        return $this->value;
    }

    /**
     * @param float $value
     * @throws Exception
     */
    public function setValue(float $value): void {

        // Verifica o valor
        if ($value <= 0) {

            throw new Exception("O valor informado não é válido.", 400);

        }

        $this->value = $value;
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

}
