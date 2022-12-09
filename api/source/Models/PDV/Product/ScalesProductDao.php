<?php

namespace Source\Models\PDV\Product;

use PDO;
use Source\Core\Connection;

class ScalesProductDao {

    /**
     * @param string $userName
     * @param int|null $type
     */
    public function __construct(
        protected string $userName,
        protected ?int $type = 2
    ) {}

    /**
     * @return array
     */
    public function read(): array {

        // Monta SQL
        $sql = "SELECT * FROM product WHERE scaleDate IS NOT NULL ORDER BY name";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}