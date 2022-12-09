<?php

namespace Source\Models\PDV\ProductCategory;

class ProductCategory {

    private int $code;
    private string $name;
    private ?bool $favorite = false;

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
     * @return bool|null
     */
    public function getFavorite(): ?bool {
        return $this->favorite;
    }

    /**
     * @param bool|null $favorite
     */
    public function setFavorite(?bool $favorite): void {
        $this->favorite = $favorite;
    }

}
