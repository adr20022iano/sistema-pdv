<?php

namespace Source\Models\PDV\BookCategory;

use Exception;
use PDO;
use Source\Core\Connection;

class BookCategoryDao {

    /**
     * BookCategoryDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName
    ) {}

    /**
     * Regista uma nova categoria
     * @param BookCategory $obj
     * @throws Exception
     */
    public function create(BookCategory $obj): void {

        // Monta SQL
        $sql = "INSERT INTO category (name, type) VALUES (:name, :type)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::bookCategoryData($stmt, $obj);

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * Consulta as category
     * @return array
     */
    public function read(): array {

        // Monta SQL
        $sql = "SELECT * FROM category ORDER BY name";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Atualiza uma categoria
     * @param BookCategory $obj
     * @throws Exception
     */
    public function update(BookCategory $obj): void {

        // Monta SQL
        $sql = "UPDATE category SET name = :name, type = :type WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::bookCategoryData($stmt, $obj);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        self::executeStmt($stmt);

    }

    /**
     * Delata uma categoria
     * @param BookCategory $obj
     */
    public function delete(BookCategory $obj): void {

        // Monta SQL e deleta a categoria
        $sql = "DELETE FROM category WHERE code = :code and code > '1'";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

    }

    /**
     * @param object $stmt
     * @param object $obj
     * @return object
     */
    private function bookCategoryData(object $stmt, object $obj): object {

        $stmt->bindValue(":name", $obj->getName());
        $stmt->bindValue(":type", $obj->getType(), PDO::PARAM_INT);

        return $stmt;

    }

    /**
     * @param object $stmt
     * @throws Exception
     */
    private function executeStmt(object $stmt): void {

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
