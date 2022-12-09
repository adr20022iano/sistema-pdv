<?php

namespace Source\Models\PDV\Seller;

use Exception;
use PDO;
use Source\Core\Connection;

class SellerDao {

    /**
     * SellerDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}
    
    /**
     * @param Seller $obj
     * @throws Exception
     */
    public function create(Seller $obj): void {

        // Gera código externo
        $externalSalesCode = generatePassword(4, false)."-".generatePassword(4, false)."-".generatePassword(4, false)."-".generatePassword(4, false);
  
        // Monta SQL
        $sql = "INSERT INTO seller (name, externalSalesCode) VALUES (:name, :externalSalesCode)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":externalSalesCode", $externalSalesCode);
        $stmt = self::sellerData($stmt, $obj);

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * @param Seller $obj
     * @return object|bool
     */
    public function read(Seller $obj): object|bool {

        // Monta SQL
        $sql = "SELECT * FROM seller WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode());
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * @return array
     */
    public function readAll(): array {

        // Monta SQL
        $sql = "SELECT * FROM seller";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * @param Seller $obj
     * @return object|bool
     */
    public function readExternal(Seller $obj): object|bool {

        // Monta SQL
        $sql = "SELECT * FROM seller WHERE externalSalesCode = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getExternalSalesCode());
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * @param Seller $obj
     * @throws Exception
     */
    public function update(Seller $obj): void {

        // Monta SQL
        $sql = "UPDATE seller SET name = :name WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::sellerData($stmt, $obj);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        self::executeStmt($stmt);

    }

    /**
     * @param Seller $obj
     */
    public function delete(Seller $obj): void {

        // Monta SQL e deleta operações
        $sql = "DELETE FROM seller WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

    }

    /**
     * @param object $stmt
     * @param object $obj
     * @return object
     */
    private static function sellerData(object $stmt, object $obj): object {

        $stmt->bindValue(":name", $obj->getName());

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
                1062 => new Exception("Esse(a) vendedor(a) já existe.", 409),
                default => new Exception(checkForErrorInMysql($e), 400),
            };

        }

    }

}
