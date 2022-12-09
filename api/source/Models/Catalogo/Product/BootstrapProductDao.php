<?php

namespace Source\Models\Catalogo\Product;

use PDO;
use Source\Core\Connection;

class BootstrapProductDao {

    /**
     * BootstrapProductDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * Consulta as categorias aleatórias
     * @return array
     */
    public function readCategory(): array {

        // Monta SQL
        $sql = "SELECT * FROM bootstrapProductCategory";
        $stmt = Connection::getConn($this->userName)->prepare($sql);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Consulta produtos aleatórios
     * @param int $categoryCode
     * @return array
     */
    public function readProduct(int $categoryCode): array {

        // Monta SQL
        $sql = "SELECT * FROM bootstrapProduct WHERE categoryCode = :categoryCode ORDER BY RAND() LIMIT 4";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":categoryCode", $categoryCode, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}
