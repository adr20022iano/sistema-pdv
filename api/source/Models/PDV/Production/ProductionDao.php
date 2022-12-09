<?php

namespace Source\Models\PDV\Production;

use PDO;
use Source\Core\Connection;

class ProductionDao {

    /**
     * ProductionDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * Regista um novo produto da composição
     * @param Production $obj
     */
    public function create(Production $obj): void {

        // Inicia transação
        Connection::getConn($this->userName)->beginTransaction();

        // Monta SQL e deleta os dados de produção
        $sql = "DELETE FROM production WHERE productCode = :productCode";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":productCode", $obj->getProductCode());
        $stmt->execute();

        // Monta SQL
        $sql = "INSERT INTO production (productCode, compositionProductCode, quantity) VALUES (:productCode, :compositionProductCode, :quantity)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":productCode", $obj->getProductCode());

        // Adiciona os dados 
        foreach ($obj->getComposition() as $line) {

            $stmt->bindValue(":compositionProductCode", $line->productCode);
            $stmt->bindValue(":quantity", $line->quantity);
            $stmt->execute();

        }

        // Monta SQL e deleta os produtos de produção duplicados
        $sql = "DELETE FROM production WHERE compositionProductCode IN (SELECT code FROM product WHERE production = true)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

        // Confirma transação
        Connection::getConn($this->userName)->commit();
        
    }

    /**
     * Consulta os produtos da composição
     * @param Production $obj
     * @return array
     */
    public function read(Production $obj): array {

        // Monta SQL
        $sql = "SELECT 
                *
            FROM 
                productionList
            WHERE 
                productCode = :productCode 
        ";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":productCode", $obj->getProductCode());
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}