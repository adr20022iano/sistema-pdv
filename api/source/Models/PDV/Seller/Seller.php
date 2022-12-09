<?php

namespace Source\Models\PDV\Seller;

class Seller {

    private int $code;
    private string $name;
    private ?string $externalSalesCode = null;

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
     * @return string
     */
    public function getName(): string {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name): void {
        $this->name = $name;
    }

    /**
     * @return string|null
     */
    public function getExternalSalesCode(): ?string {
        return $this->externalSalesCode;
    }

    /**
     * @param string|null $externalSalesCode
     */
    public function setExternalSalesCode(?string $externalSalesCode): void {
        $this->externalSalesCode = $externalSalesCode;
    }

}
