<?php

namespace Source\Models\BaseModels\Customer;

use Exception;

class CustomerFilter {

    private ?int $page = null;
    private ?int $code = null;
    private ?string $filterCity = null;
    private ?string $name = null;
    private ?int $sale = 0;
    private ?int $filterCatalog = 0;
    private ?string $filterEmail = null;
    private ?int $notCode = null;
    private ?string $filterDocument = null;

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
    public function getCode(): ?int {
        return $this->code;
    }

    /**
     * @param int|null $code
     */
    public function setCode(?int $code): void {
        $this->code = $code;
    }

    /**
     * @return string|null
     */
    public function getFilterCity(): ?string {
        return $this->filterCity;
    }

    /**
     * @param string|null $filterCity
     */
    public function setFilterCity(?string $filterCity): void {
        $this->filterCity = $filterCity;
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
    public function getSale(): ?int {
        return $this->sale;
    }

    /**
     * @param int|null $sale
     */
    public function setSale(?int $sale): void {
        $this->sale = $sale;
    }

    /**
     * @return int|null
     */
    public function getFilterCatalog(): ?int {
        return $this->filterCatalog;
    }

    /**
     * @param int|null $filterCatalog
     */
    public function setFilterCatalog(?int $filterCatalog): void {
        $this->filterCatalog = $filterCatalog;
    }

    /**
     * @return string|null
     */
    public function getFilterEmail(): ?string {
        return $this->filterEmail;
    }

    /**
     * @param string|null $filterEmail
     * @throws Exception
     */
    public function setFilterEmail(?string $filterEmail): void {

        if (!empty($filterEmail)) {

            // Verifica e-mail
            if (validateEmail($filterEmail)) {
                $this->filterEmail = $filterEmail;
            } else {

                throw new Exception("E-Mail inválido", 409);

            }

        } else {

            $this->filterEmail = null;

        }

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
    public function getFilterDocument(): ?string {
        return $this->filterDocument;
    }

    /**
     * @param string|null $filterDocument
     */
    public function setFilterDocument(?string $filterDocument): void {
        $this->filterDocument = $filterDocument;
    }

}
