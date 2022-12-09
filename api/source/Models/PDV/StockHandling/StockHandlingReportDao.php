<?php

namespace Source\Models\PDV\StockHandling;

use PDO;
use Source\Core\Connection;

class StockHandlingReportDao {

    /**
     * StockHandlingReportDao constructor.
     * @param string $userName
     * @param int|null $type
     */
    public function __construct(
        private string $userName,
        protected ?int $type = 2
    ) {}

    /**
     * Consulta os produtos
     * @param StockHandlingReport $obj
     * @return array
     */
    public function read(StockHandlingReport $obj): array {

        // Verifica se filtra por produto
        $sqlProductCode = is_numeric($obj->getProductCode()) ? "AND productCode = :productCode"  : null;

        // Monta marcadores dinâmicos
        $type  = implode(",", $obj->getType());

        // Monta SQL
        $sql = "SELECT 
                * 
            FROM 
                stockHandlingReport
            WHERE 
                type IN ($type)
                AND DATE_FORMAT(date, '%Y-%m-%d') BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d') AND DATE_FORMAT(:endDate, '%Y-%m-%d')
                $sqlProductCode
            
        ";

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":startDate", $obj->getStartDate());
        $stmt->bindValue(":endDate", $obj->getEndDate());

        // Verifica se filtra por produto
        if (is_numeric($obj->getProductCode())) {
            $stmt->bindValue(":productCode", $obj->getProductCode(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}
