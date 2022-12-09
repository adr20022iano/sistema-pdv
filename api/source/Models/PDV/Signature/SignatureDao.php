<?php

namespace Source\Models\PDV\Signature;

use PDO;
use Source\Core\Connection;
use Source\Models\BaseModels\Signature\SignatureDao AS SignatureDaoBase;

class SignatureDao extends SignatureDaoBase {

    /**
     * @param Signature $obj
     */
    public function upCompanyDetails(Signature $obj): void {

        // Monta SQL
        $sql = <<<SQL
                UPDATE 
                    signature 
                SET
                    name = :name,
                    fantasyName = :fantasyName,
                    document = :document,
                    phone = :phone,
                    email = :email,
                    cep = :cep,
                    address = :address,
                    number = :number,
                    city = :city,
                    district = :district,
                    complement = :complement
                WHERE 
                      code = 1
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":name", $obj->getName());
        $stmt->bindValue(":fantasyName", $obj->getFantasyName());
        $stmt->bindValue(":document", $obj->getDocument());
        $stmt->bindValue(":phone", $obj->getPhone());
        $stmt->bindValue(":email", $obj->getEmail());
        $stmt->bindValue(":cep", $obj->getCep());
        $stmt->bindValue(":address", $obj->getAddress());
        $stmt->bindValue(":number", $obj->getNumber());
        $stmt->bindValue(":city", $obj->getCity());
        $stmt->bindValue(":district", $obj->getDistrict());
        $stmt->bindValue(":complement", $obj->getComplement());
        $stmt->execute();

    }

    /**
     * @param Signature $obj
     */
    public function upSystemBehavior(Signature $obj): void {

        // Monta SQL
        $sql = <<<SQL
                UPDATE 
                    signature 
                SET
                    saleObservation = :saleObservation,
                    postSalePrintPagesNumber = :postSalePrintPagesNumber,
                    couponMarginRight = :couponMarginRight,
                    couponMarginLeft = :couponMarginLeft,
                    useProduction = :useProduction,
                    requiredSeller = :requiredSeller,
                    requiredCustomerOnSale = :requiredCustomerOnSale,
                    selectedAverageCost = :selectedAverageCost,
                    calculateStock = :calculateStock,
                    receiptType = :receiptType
                WHERE 
                    code = 1
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleObservation", $obj->getSaleObservation());
        $stmt->bindValue(":postSalePrintPagesNumber", $obj->getPostSalePrintPagesNumber(), PDO::PARAM_INT);
        $stmt->bindValue(":couponMarginRight", $obj->getCouponMarginRight(), PDO::PARAM_INT);
        $stmt->bindValue(":couponMarginLeft", $obj->getCouponMarginLeft(), PDO::PARAM_INT);
        $stmt->bindValue(":useProduction", $obj->getUseProduction(), PDO::PARAM_BOOL);
        $stmt->bindValue(":requiredSeller", $obj->getRequiredSeller(), PDO::PARAM_INT);
        $stmt->bindValue(":requiredCustomerOnSale", $obj->getRequiredCustomerOnSale(), PDO::PARAM_BOOL);
        $stmt->bindValue(":selectedAverageCost", $obj->getSelectedAverageCost(), PDO::PARAM_BOOL);
        $stmt->bindValue(":calculateStock", $obj->getCalculateStock(), PDO::PARAM_BOOL);
        $stmt->bindValue(":receiptType", $obj->getReceiptType(), PDO::PARAM_INT);
        $stmt->execute();

    }

    /**
     * @param Signature $obj
     */
    public function upSellerPermissions(Signature $obj): void {

        // Monta SQL
        $sql = <<<SQL
                UPDATE 
                    signature 
                SET
                    sellerDeletePayment = :sellerDeletePayment,
                    sellerDeleteSale = :sellerDeleteSale,
                    sellerSalesReport = :sellerSalesReport,
                    sellerDiscount = :sellerDiscount
                WHERE 
                      code = 1
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":sellerDeletePayment", $obj->getSellerDeletePayment(), PDO::PARAM_BOOL);
        $stmt->bindValue(":sellerDeleteSale", $obj->getSellerDeleteSale(), PDO::PARAM_BOOL);
        $stmt->bindValue(":sellerSalesReport", $obj->getSellerSalesReport(), PDO::PARAM_BOOL);
        $stmt->bindValue(":sellerDiscount", $obj->getSellerDiscount(), PDO::PARAM_BOOL);
        $stmt->execute();

    }

    /**
     * @param Signature $obj
     */
    public function upSystemResources(Signature $obj): void {

        // Monta SQL
        $sql = <<<SQL
                UPDATE
                    signature 
                SET
                    scaleIntegration = :scaleIntegration,
                    useProductImage = :useProductImage
                WHERE 
                      code = 1
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":scaleIntegration", $obj->getScaleIntegration(), PDO::PARAM_BOOL);
        $stmt->bindValue(":useProductImage", $obj->getUseProductImage(), PDO::PARAM_BOOL);
        $stmt->execute();

    }

    /**
     * @param Signature $obj
     */
    public function upSystemCatalog(Signature $obj): void {

        // Monta SQL
        $sql = <<<SQL
                UPDATE 
                    signature 
                SET
                    showPriceOnCatalogAfterLogin = :showPriceOnCatalogAfterLogin
                WHERE 
                    code = 1
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":showPriceOnCatalogAfterLogin", $obj->getShowPriceOnCatalogAfterLogin(), PDO::PARAM_BOOL);
        $stmt->execute();

    }

    /**
     * @param Signature $obj
     */
    public function updatePassword(Signature $obj): void {

        // Gera hash da senha
        $password = password_hash($obj->getPassword(), PASSWORD_DEFAULT);

        // Monta SQL
        $sql = "UPDATE signature SET password = :password WHERE code = 1";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":password", $password);
        $stmt->execute();

    }

}
