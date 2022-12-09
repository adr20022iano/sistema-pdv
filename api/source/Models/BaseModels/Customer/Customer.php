<?php

namespace Source\Models\BaseModels\Customer;

class Customer {

    private int $code;
    private string $name;
    private ?string $document = null;
    private ?string $phone = null;
    private ?string $cep = null;
    private ?string $city = null;
    private ?string $address = null;
    private ?string $district = null;
    private ?string $number = null;
    private ?string $complement = null;

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
     * @return string|null
     */
    public function getDocument(): ?string {
        return $this->document;
    }

    /**
     * @param string|null $document
     */
    public function setDocument(?string $document): void {
        $this->document = $document;
    }

    /**
     * @return string|null
     */
    public function getPhone(): ?string {
        return $this->phone;
    }

    /**
     * @param string|null $phone
     */
    public function setPhone(?string $phone): void {
        $this->phone = $phone;
    }

    /**
     * @return string|null
     */
    public function getCep(): ?string {
        return $this->cep;
    }

    /**
     * @param string|null $cep
     */
    public function setCep(?string $cep): void {
        $this->cep = $cep;
    }

    /**
     * @return string|null
     */
    public function getCity(): ?string {
        return $this->city;
    }

    /**
     * @param string|null $city
     */
    public function setCity(?string $city): void {
        $this->city = $city;
    }

    /**
     * @return string|null
     */
    public function getAddress(): ?string {
        return $this->address;
    }

    /**
     * @param string|null $address
     */
    public function setAddress(?string $address): void {
        $this->address = $address;
    }

    /**
     * @return string|null
     */
    public function getDistrict(): ?string {
        return $this->district;
    }

    /**
     * @param string|null $district
     */
    public function setDistrict(?string $district): void {
        $this->district = $district;
    }

    /**
     * @return string|null
     */
    public function getNumber(): ?string {
        return $this->number;
    }

    /**
     * @param string|null $number
     */
    public function setNumber(?string $number): void {
        $this->number = $number;
    }

    /**
     * @return string|null
     */
    public function getComplement(): ?string {
        return $this->complement;
    }

    /**
     * @param string|null $complement
     */
    public function setComplement(?string $complement): void {
        $this->complement = $complement;
    }

}
