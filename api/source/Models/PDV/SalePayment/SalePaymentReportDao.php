<?php

namespace Source\Models\PDV\SalePayment;

use PDO;
use Source\Core\Connection;

class SalePaymentReportDao {

    /**
     * SaleReportDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * Consulta os produtos
     * @param SalePaymentReport $obj
     * @return array
     */
    public function read(SalePaymentReport $obj): array {

        // Verifica se filtra por cliente
        $customer = is_numeric($obj->getCustomerCode()) ? "AND customerCode = :customerCode" : null;

        // Verifica se filtra por tipo
        $type = !empty($obj->getType()) ?  "AND type = :type" : null;

        // Monta SQL
        $sql = "SELECT 
                * 
            FROM 
                paymentReport
            WHERE
                DATE_FORMAT(date, '%Y-%m-%d') BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d') AND DATE_FORMAT(:endDate, '%Y-%m-%d')
                $customer
                $type
        ";

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":startDate", $obj->getStartDate());
        $stmt->bindValue(":endDate", $obj->getEndDate());

        // Verifica se filtra por cliente
        if (is_numeric($obj->getCustomerCode())) {
            $stmt->bindValue(":customerCode", $obj->getCustomerCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por tipo
        if (!empty($obj->getType())) {
            $stmt->bindValue(":type", $obj->getType(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}
