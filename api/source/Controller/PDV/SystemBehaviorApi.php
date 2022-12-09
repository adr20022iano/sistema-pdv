<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Source\Controller\PDV\CompanyDetailsApi AS CompanyDetailsApi;
use Exception;

class SystemBehaviorApi extends CompanyDetailsApi {

    /**
     * Consulta os registros
     */
    public function read(): void {

        // Consulta assinatura
        $line = $this->signatureDao->read();

        // Renderização da view
        view(200, [
            "saleObservation" => $line->saleObservation,
            "postSalePrintPagesNumber" => (int) $line->postSalePrintPagesNumber,
            "couponMarginRight" => (int) $line->couponMarginRight,
            "couponMarginLeft" => (int) $line->couponMarginLeft,
            "useProduction" => (bool) $line->useProduction,
            "requiredSeller" => (int) $line->requiredSeller,
            "requiredCustomerOnSale" => (bool) $line->requiredCustomerOnSale,
            "selectedAverageCost" => (bool) $line->selectedAverageCost,
            "calculateStock" => (bool) $line->calculateStock,
            "receiptType" => (int) $line->receiptType
        ]);

    }

    /**
     * Atualiza um registro
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto
        if (!empty($this->obj->saleObservation)) {
            $this->signature->setSaleObservation($this->obj->saleObservation);
        }

        if (isset($this->obj->postSalePrintPagesNumber)) {
            $this->signature->setPostSalePrintPagesNumber($this->obj->postSalePrintPagesNumber);
        }

        if (!empty($this->obj->couponMarginRight)) {
            $this->signature->setCouponMarginRight($this->obj->couponMarginRight);
        }

        if (!empty($this->obj->couponMarginLeft)) {
            $this->signature->setCouponMarginLeft($this->obj->couponMarginLeft);
        }

        if (!empty($this->obj->useProduction)) {
            $this->signature->setUseProduction($this->obj->useProduction);
        }

        if (!empty($this->obj->requiredSeller)) {
            $this->signature->setRequiredSeller($this->obj->requiredSeller);
        }

        if (!empty($this->obj->requiredCustomerOnSale)) {
            $this->signature->setRequiredCustomerOnSale($this->obj->requiredCustomerOnSale);
        }

        if (!empty($this->obj->selectedAverageCost)) {
            $this->signature->setSelectedAverageCost($this->obj->selectedAverageCost);
        }

        if (!empty($this->obj->calculateStock)) {
            $this->signature->setCalculateStock($this->obj->calculateStock);
        }

        if (!empty($this->obj->receiptType)) {
            $this->signature->setReceiptType($this->obj->receiptType);
        }

        $this->signatureDao->upSystemBehavior($this->signature);

        // Renderização da view
        view(204);

    }

}
