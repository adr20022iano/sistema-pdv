<?php

namespace Source\Models\PDV\BookCategory;

use Exception;

class BookCategory {

    private int $code;
    private string $name;
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
    public function getType(): ?int {
        return $this->type;
    }

    /**
     * @param int $type
     * @throws Exception
     */
    public function setType(int $type): void {

        // Verifica se categoria é válida
        if (($type < 1) || ($type > 2)) {
            throw new Exception("Tipo da categoria é inválida.", 409);
        } else {
            $this->type = $type;
        }

    }

}
