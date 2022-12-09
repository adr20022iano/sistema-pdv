<?php

namespace Source\Models\PDV\ProductCategory;

use Exception;
use PDO;
use Source\Core\Connection;

class ProductCategoryDao {

    /**
     * ProductCategoryDao constructor.
     * @param string $userName
     * @param int|null $type
     */
    public function __construct(
        private readonly string $userName,
        protected ?int $type = 2
    ) {}
    
    /**
     *  Regista uma nova categoria
     * @param ProductCategory $obj
     * @throws Exception
     */
    public function create(ProductCategory $obj): void {

        // Monta SQL
        $sql = "INSERT INTO productCategory (name, favorite) VALUES (:name, :favorite)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::productCategoryData($stmt, $obj);

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * Consulta as category
     * @return array
     */
    public function read(): array {

        // Monta SQL
        $sql = "SELECT * FROM productCategory ORDER BY name";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Atualiza uma categoria
     * @param ProductCategory $obj
     * @throws Exception
     */
    public function update(ProductCategory $obj): void {

        // Monta SQL
        $sql = "UPDATE productCategory SET name = :name, favorite = :favorite WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::productCategoryData($stmt, $obj);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        self::executeStmt($stmt);

    }

    /**
     * Delata uma categoria
     * @param ProductCategory $obj
     * @throws Exception
     */
    public function delete(ProductCategory $obj): void {

        // Monta SQL e deleta a categoria
        $sql = "DELETE FROM productCategory WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

    }

    /**
     * @param object $stmt
     * @param ProductCategory $obj
     * @return object
     */
    private static function productCategoryData(object $stmt, ProductCategory $obj): object {

        $stmt->bindValue(":name", $obj->getName());
        $stmt->bindValue(":favorite", $obj->getFavorite(), PDO::PARAM_BOOL);

        return $stmt;

    }

    /**
     * @param object $stmt
     * @throws Exception
     */
    private static function executeStmt(object $stmt): void {

        try {

            $stmt->execute();

        } catch(Exception $e) {

            throw match ($stmt->errorInfo()[1]) {
                1062 => new Exception("Essa categoria já existe.", 409),
                default => new Exception(checkForErrorInMysql($e), 400),
            };

        }

    }

}
