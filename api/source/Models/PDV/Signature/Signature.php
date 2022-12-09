<?php

namespace Source\Models\PDV\Signature;

use Exception;
use Source\Models\PDV\Signature\Enum\ReceiptType;

class Signature {

    private ?string $saleObservation = null;
    private ?string $name = null;
    private ?string $fantasyName = null;
    private ?string $password = null;
    private ?string $city = null;
    private ?string $district = null;
    private ?string $cep = null;
    private ?string $address = null;
    private ?string $number = null;
    private ?string $complement = null;
    private ?string $phone = null;
    private ?int $requiredSeller = 0;
    private ?int $postSalePrintPagesNumber = 0;
    private ?string $document = null;
    private ?bool $scaleIntegration = false;
    private ?int $couponMarginRight = 0;
    private ?int $couponMarginLeft = 0;
    private ?bool $useProductImage = false;
    private ?bool $sellerDeletePayment = false;
    private ?bool $sellerDeleteSale = false;
    private ?bool $sellerSalesReport = false;
    private ?bool $useProduction = false;
    private ?bool $selectedAverageCost = false;
    private ?bool $requiredCustomerOnSale = false;
    private ?bool $calculateStock = false;
    private ?bool $sellerDiscount = false;
    private ?string $email = null;
    private ?bool $showPriceOnCatalogAfterLogin = false;
    private ?int $receiptType = 1;

    /**
     * @return string|null
     */
    public function getSaleObservation(): ?string {
        return $this->saleObservation;
    }

    /**
     * @param string|null $saleObservation
     */
    public function setSaleObservation(?string $saleObservation): void {
        $this->saleObservation = $saleObservation;
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
     * @return string|null
     */
    public function getFantasyName(): ?string {
        return $this->fantasyName;
    }

    /**
     * @param string|null $fantasyName
     */
    public function setFantasyName(?string $fantasyName): void {
        $this->fantasyName = $fantasyName;
    }

    /**
     * @return string|null
     */
    public function getPassword(): ?string {
        return $this->password;
    }

    /**
     * @param string|null $password
     */
    public function setPassword(?string $password): void {
        $this->password = $password;
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
     * @return int|null
     */
    public function getRequiredSeller(): ?int {
        return $this->requiredSeller;
    }

    /**
     * @param int|null $requiredSeller
     * @throws Exception
     */
    public function setRequiredSeller(?int $requiredSeller): void {

        if (($requiredSeller < 0) || ($requiredSeller > 2)) {

            throw new Exception("Comportamento do vendedor inválido.", 409);

        } else {

            $this->requiredSeller = $requiredSeller;

        }

    }

    /**
     * @return int|null
     */
    public function getPostSalePrintPagesNumber(): ?int {
        return $this->postSalePrintPagesNumber;
    }

    /**
     * @param int|null $postSalePrintPagesNumber
     */
    public function setPostSalePrintPagesNumber(?int $postSalePrintPagesNumber): void {

        // Verifica a quantidade máxima de impressão
        $this->postSalePrintPagesNumber = $postSalePrintPagesNumber > 3 ? 3 : $postSalePrintPagesNumber;
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
     * @return bool|null
     */
    public function getScaleIntegration(): ?bool {
        return $this->scaleIntegration;
    }

    /**
     * @param bool|null $scaleIntegration
     */
    public function setScaleIntegration(?bool $scaleIntegration): void {
        $this->scaleIntegration = $scaleIntegration;
    }

    /**
     * @return int|null
     */
    public function getCouponMarginRight(): ?int {
        return $this->couponMarginRight;
    }

    /**
     * @param int|null $couponMarginRight
     */
    public function setCouponMarginRight(?int $couponMarginRight): void {
        $this->couponMarginRight = $couponMarginRight;
    }

    /**
     * @return int|null
     */
    public function getCouponMarginLeft(): ?int {
        return $this->couponMarginLeft;
    }

    /**
     * @param int|null $couponMarginLeft
     */
    public function setCouponMarginLeft(?int $couponMarginLeft): void {
        $this->couponMarginLeft = $couponMarginLeft;
    }

    /**
     * @return bool|null
     */
    public function getUseProductImage(): ?bool {
        return $this->useProductImage;
    }

    /**
     * @param bool|null $useProductImage
     */
    public function setUseProductImage(?bool $useProductImage): void {
        $this->useProductImage = $useProductImage;
    }

    /**
     * @return bool|null
     */
    public function getSellerDeletePayment(): ?bool {
        return $this->sellerDeletePayment;
    }

    /**
     * @param bool|null $sellerDeletePayment
     */
    public function setSellerDeletePayment(?bool $sellerDeletePayment): void {
        $this->sellerDeletePayment = $sellerDeletePayment;
    }

    /**
     * @return bool|null
     */
    public function getSellerDeleteSale(): ?bool {
        return $this->sellerDeleteSale;
    }

    /**
     * @param bool|null $sellerDeleteSale
     */
    public function setSellerDeleteSale(?bool $sellerDeleteSale): void {
        $this->sellerDeleteSale = $sellerDeleteSale;
    }

    /**
     * @return bool|null
     */
    public function getSellerSalesReport(): ?bool {
        return $this->sellerSalesReport;
    }

    /**
     * @param bool|null $sellerSalesReport
     */
    public function setSellerSalesReport(?bool $sellerSalesReport): void {
        $this->sellerSalesReport = $sellerSalesReport;
    }

    /**
     * @return bool|null
     */
    public function getUseProduction(): ?bool {
        return $this->useProduction;
    }

    /**
     * @param bool|null $useProduction
     */
    public function setUseProduction(?bool $useProduction): void {
        $this->useProduction = $useProduction;
    }

    /**
     * @return bool|null
     */
    public function getSelectedAverageCost(): ?bool {
        return $this->selectedAverageCost;
    }

    /**
     * @param bool|null $selectedAverageCost
     */
    public function setSelectedAverageCost(?bool $selectedAverageCost): void {
        $this->selectedAverageCost = $selectedAverageCost;
    }

    /**
     * @return bool|null
     */
    public function getRequiredCustomerOnSale(): ?bool {
        return $this->requiredCustomerOnSale;
    }

    /**
     * @param bool|null $requiredCustomerOnSale
     */
    public function setRequiredCustomerOnSale(?bool $requiredCustomerOnSale): void {
        $this->requiredCustomerOnSale = $requiredCustomerOnSale;
    }

    /**
     * @return bool|null
     */
    public function getCalculateStock(): ?bool {
        return $this->calculateStock;
    }

    /**
     * @param bool|null $calculateStock
     */
    public function setCalculateStock(?bool $calculateStock): void {
        $this->calculateStock = $calculateStock;
    }

    /**
     * @return bool|null
     */
    public function getSellerDiscount(): ?bool {
        return $this->sellerDiscount;
    }

    /**
     * @param bool|null $sellerDiscount
     */
    public function setSellerDiscount(?bool $sellerDiscount): void {
        $this->sellerDiscount = $sellerDiscount;
    }

    /**
     * @return string|null
     */
    public function getEmail(): ?string {
        return $this->email;
    }

    /**
     * @param string|null $email
     * @throws Exception
     */
    public function setEmail(?string $email): void {

        // Verifica e-mail
        if (validateEmail($email)) {
            $this->email = $email;
        } else {

            throw new Exception("E-Mail inválido.", 409);

        }

    }

    /**
     * @return bool|null
     */
    public function getShowPriceOnCatalogAfterLogin(): ?bool {
        return $this->showPriceOnCatalogAfterLogin;
    }

    /**
     * @param bool|null $showPriceOnCatalogAfterLogin
     */
    public function setShowPriceOnCatalogAfterLogin(?bool $showPriceOnCatalogAfterLogin): void {
        $this->showPriceOnCatalogAfterLogin = $showPriceOnCatalogAfterLogin;
    }

    /**
     * @return int|null
     */
    public function getReceiptType(): ?int {
        return $this->receiptType;
    }

    /**
     * @param int|null $receiptType
     * @throws Exception
     */
    public function setReceiptType(?int $receiptType): void {

        if (!ReceiptType::tryFrom($receiptType)) {

            throw new Exception("O tipo de recibo é inválido.", 400);

        } else {

            $this->receiptType = $receiptType;

        }

    }

}
