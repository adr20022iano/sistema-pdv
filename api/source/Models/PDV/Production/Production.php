<?php

namespace Source\Models\PDV\Production;

class Production {

    private int $code;
    private int $productCode;
    private array $composition;

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
     * @return array
     */
    public function getComposition(): array {
        return $this->composition;
    }

    /**
     * @param array $composition
     */
    public function setComposition(array $composition): void {
        $this->composition = $composition;
    }

}
