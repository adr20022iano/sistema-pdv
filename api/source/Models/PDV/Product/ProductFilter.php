<?php

namespace Source\Models\PDV\Product;

use Exception;
use Source\Models\PDV\Product\Enum\Production;
use Source\Models\PDV\Product\Enum\Sale;
use Source\Models\PDV\Product\Enum\TypeCode;

class ProductFilter {

    private ?int $page = null;
    private ?bool $noPagination = false;
    private ?int $production = null;
    private ?int $sale = null;
    private ?int $typeCode = 0;
    private ?string $code = null;
    private ?string $name = null;
    private ?int $categoryCode = null;
    private ?int $catalogSale = null;
    private ?int $notCode = null;
    private ?string $exactName = null;
    private ?array $codes = null;

    /**
     * @return int|null
     */
    public function getPage(): ?int {
        return $this->page;
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
    public function getProduction(): ?int {
        return $this->production;
    }

    /**
     * @param int|null $production
     * @throws Exception
     */
    public function setProduction(?int $production): void {

        if (!Production::tryFrom($production)) {

            throw new Exception("O tipo de filtro é inválido para o produto.", 400);

        } else {

            $this->production = $production;

        }

    }

    /**
     * @return int|null
     */
    public function getSale(): ?int {
        return $this->sale;
    }

    /**
     * @param int|null $sale
     * @throws Exception
     */
    public function setSale(?int $sale): void {

        if (!Sale::tryFrom($sale)) {

            throw new Exception("O tipo de filtro é inválido para o produto.", 400);

        } else {

            $this->sale = $sale;

        }

    }

    /**
     * @return int|null
     */
    public function getTypeCode(): ?int {
        return $this->typeCode;
    }

    /**
     * @param int|null $typeCode
     * @throws Exception
     */
    public function setTypeCode(?int $typeCode): void {

        if (!TypeCode::tryFrom($typeCode)) {

            throw new Exception("O tipo de filtro é inválido para o código.", 400);

        } else {

            $this->typeCode = $typeCode;

        }

    }

    /**
     * @return string|null
     */
    public function getCode(): ?string {
        return $this->code;
    }

    /**
     * @param string|null $code
     */
    public function setCode(?string $code): void {
        $this->code = $code;
    }

    /**
     * @return string|null
     */
    public function getName(): ?string {
        return $this->name;
    }

    /**
     * @param string|null $name
     */
    public function setName(?string $name): void {
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
     * @return int|null
     */
    public function getCatalogSale(): ?int {
        return $this->catalogSale;
    }

    /**
     * @param int|null $catalogSale
     */
    public function setCatalogSale(?int $catalogSale): void {
        $this->catalogSale = $catalogSale;
    }

    /**
     * Otimiza filtro de produtos por nome, código e código de barras
     * @param array $array
     * @param string|null $dataToFilter
     * @return array
     */
    public function optimizeFilter(array $array, ?string $dataToFilter): array {

        // Verifica filtro por nome
        if ($dataToFilter) {

            $untreatedList = $array;

            // Consulta a key do produto
            $keyCode = array_search($dataToFilter, array_column($untreatedList, 'code'));
            $keyBarCode = array_search($dataToFilter, array_column($untreatedList, 'barCode'));

            // Remove item da lista nova
            if ($keyCode) {
                unset($array[$keyCode]);
            }

            if ($keyBarCode) {
                unset($array[$keyBarCode]);
            }

            // Adiciona o primeiro ‘item’ no array
            if ($keyBarCode) {
                array_unshift($array, $untreatedList[$keyBarCode]);
            }

            if ($keyCode) {
                array_unshift($array, $untreatedList[$keyCode]);
            }

        }

        return $array;

    }

    /**
     * @return int|null
     */
    public function getNotCode(): ?int {
        return $this->notCode;
    }

    /**
     * @param int|null $notCode
     */
    public function setNotCode(?int $notCode): void {
        $this->notCode = $notCode;
    }

    /**
     * @return string|null
     */
    public function getExactName(): ?string {
        return $this->exactName;
    }

    /**
     * @param string|null $exactName
     */
    public function setExactName(?string $exactName): void {
        $this->exactName = $exactName;
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

}
