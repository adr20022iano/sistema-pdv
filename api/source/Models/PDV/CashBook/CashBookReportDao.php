<?php

namespace Source\Models\PDV\CashBook;

use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Sale\SaleReport;

class CashBookReportDao {

    /**
     * CashBookReportDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * @param CashBookReport $obj
     * @return array
     */
    public function read(CashBookReport $obj): array {

        // Monta marcadores dinâmicos
        $categoryCode  = implode(",", $obj->getCategoryCode());

        // Monta SQL
        $sql = <<<SQL
            SELECT 
                * 
            FROM 
                cashBookReport
            WHERE 
                categoryCode IN ($categoryCode)
                AND DATE_FORMAT(date, '%Y-%m-%d') BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d') AND DATE_FORMAT(:endDate, '%Y-%m-%d')
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":startDate", $obj->getStartDate());
        $stmt->bindValue(":endDate", $obj->getEndDate());

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Consulta os produtos
     * @param CashBookReport $obj
     * @param SaleReport $saleObj
     * @return array
     */
    public function readToSale(CashBookReport $obj, SaleReport $saleObj): array {

        // Verifica se remove pedidos
        $sqlCodeNotIn = !empty($obj->getSaleCodeNotIn()) ? "AND saleCode NOT IN (".implode(",", $obj->getSaleCodeNotIn()).") AND saleCode IS NOT null" : null;

        // Verifica se filtra por cliente
        $sqlCustomer = is_numeric($saleObj->getCustomerCode()) ? "AND customerCode = :customerCode" : null;

        // Verifica se filtra por vendedor
        if (is_numeric($saleObj->getSellerCode()) and $saleObj->getSellerCode() > 0) {
            $sqlSeller = "AND sellerCode = :sellerCode";
        } elseif ($saleObj->getSellerCode() === 0) {
            $sqlSeller = "AND sellerCode is NULL";
        } else {
            $sqlSeller = null;
        }

        // Monta SQL
        $sql = <<<SQL
            SELECT 
                * 
            FROM 
                cashBookForSaleReport
            WHERE 
                categoryCode = '1'
                AND DATE_FORMAT(date, '%Y-%m-%d') BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d') AND DATE_FORMAT(:endDate, '%Y-%m-%d')
                $sqlCodeNotIn
                $sqlCustomer
                $sqlSeller
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":startDate", $saleObj->getStartDate());
        $stmt->bindValue(":endDate", $saleObj->getEndDate());

        // Verifica se filtra por cliente
        if (is_numeric($saleObj->getCustomerCode())) {
            $stmt->bindValue(":customerCode", $saleObj->getCustomerCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por vendedor
        if (is_numeric($saleObj->getSellerCode()) and $saleObj->getSellerCode() > 0) {
            $stmt->bindValue(":sellerCode", $saleObj->getSellerCode(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}
