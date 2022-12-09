<?php

namespace Source\Models\PDV\Sale;

use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Sale\Enum\PaymentStatus;
use Source\Models\PDV\Sale\Enum\SaleReportType;

class SaleReportDao {

    /**
     * SaleReportDao constructor.
     * @param string $userName
     * @param SaleReportType|null $type
     */
    public function __construct(
        private readonly string $userName,
        private readonly ?SaleReportType $type = SaleReportType::Sales,
    ) {}

    /**
     * Consulta os produtos
     * @param SaleReport $obj
     * @return array
     */
    public function read(SaleReport $obj): array {

        // Verifica se filtra por cliente
        $sqlCustomer = is_numeric($obj->getCustomerCode()) ? "AND customerCode = :customerCode" : null;

        // Verifica se filtra por vendedor
        if (is_numeric($obj->getSellerCode()) and $obj->getSellerCode() > 0) {
            $sqlSeller = "AND sellerCode = :sellerCode";
        } elseif ($obj->getSellerCode() === 0) {
            $sqlSeller = "AND sellerCode is NULL";
        } else {
            $sqlSeller = null;
        }

        // Verifica se filtra por produto
        if (is_numeric($obj->getProductCode())) {

            $sqlProduct = match ($this->type) {
                SaleReportType::Products => "AND productCode = :productCode",
                default => "AND code IN (SELECT saleCode FROM saleProducts WHERE productCode = :productCode)",
            };

        } else {
            $sqlProduct = null;
        }

        // Verifica o tipo de filtro a ser usado
        if (!empty($obj->getPaymentStatus())) {

            $sqlPaymentStatus = match (PaymentStatus::from($obj->getPaymentStatus())) {
                PaymentStatus::Paid => "AND paidValue = ((ROUND(productsValue, 2) + ROUND(shipping, 2)) - ROUND(discount, 2))",
                PaymentStatus::Overpaid => "AND paidValue > ((ROUND(productsValue, 2) + ROUND(shipping, 2)) - ROUND(discount, 2))",
                PaymentStatus::PartiallyPaid => "AND paidValue < ((ROUND(productsValue, 2) + ROUND(shipping, 2)) - ROUND(discount, 2))",
            };

        } else {

            $sqlPaymentStatus = null;

        }

        // Monta SQL para relatório de vendas
        $sqlSale = <<<SQL
            SELECT 
                * 
            FROM 
                saleReport
            WHERE
                DATE_FORMAT(date, '%Y-%m-%d') BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d') AND DATE_FORMAT(:endDate, '%Y-%m-%d')
                $sqlCustomer
                $sqlSeller
                $sqlProduct
                $sqlPaymentStatus
        SQL;

        // Monta SQL para relatório de vendas dos produtos
        $sqlProduct = <<<SQL
            SELECT 
                name, 
                barCode,
                productCode,
                unit,
                SUM(quantity) AS quantity,
                SUM(quantity * cost) AS cost,
                SUM(quantity * value) AS value
            FROM
                saleProductReport
            WHERE
                DATE_FORMAT(date, '%Y-%m-%d') BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d') AND DATE_FORMAT(:endDate, '%Y-%m-%d')
                $sqlCustomer
                $sqlSeller
                $sqlProduct
                $sqlPaymentStatus
            GROUP BY
                name, 
                barCode,
                productCode
        SQL;

        // Verifica qual o SQL
        $sql = match ($this->type) {
            SaleReportType::Products => $sqlProduct,
            default => $sqlSale,
        };

        $stmt = Connection::getConn($this->userName)->prepare($sql);

        // Filtra por data
        $stmt->bindValue(":startDate", $obj->getStartDate());
        $stmt->bindValue(":endDate", $obj->getEndDate());

        // Verifica se filtra por vendedor
        if (is_numeric($obj->getSellerCode()) and $obj->getSellerCode() > 0) {
            $stmt->bindValue(":sellerCode", $obj->getSellerCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por cliente
        if (is_numeric($obj->getCustomerCode())) {
            $stmt->bindValue(":customerCode", $obj->getCustomerCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por produto
        if (is_numeric($obj->getProductCode())) {
            $stmt->bindValue(":productCode", $obj->getProductCode(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}
