<?php

namespace Source\Models\PDV\CashBookEntry;

use Exception;
use PDO;
use Source\Core\Connection;

class CashBookEntryDao {

    /**
     * CashBookEntryDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * Regista uma operação
     * @param CashBookEntry $obj
     * @throws Exception
     */
    public function create(CashBookEntry $obj): void {
        
        // Monta SQL
        $sql = "INSERT INTO cashBookEntry (categoryCode, value, date, history) VALUES (:categoryCode, :value, Now(), :history)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":categoryCode", $obj->getCategoryCode(), PDO::PARAM_INT);
        $stmt->bindValue(":value", $obj->getValue());
        $stmt->bindValue(":history", $obj->getHistory());

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * Consulta as operações
     * @param CashBookEntry $obj
     * @return array
     * @throws Exception
     */
    public function readAll(CashBookEntry $obj): array {

        // Monta SQL
        $sql = "SELECT 
                *
            FROM 
                cashBookEntryList
            WHERE
                DATE(date) = :date
        ";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":date", $obj->getDate());
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);
        
    }

    /**
     * @param CashBookEntry $obj
     * @return object|bool
     */
    public function read(CashBookEntry $obj): object|bool {

        // Monta SQL
        $sql = "SELECT * FROM cashBookEntry WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * @return float
     */
    public function readBalance(): float {

        // Monta SQL
        $sql = "SELECT * FROM cashBook WHERE code = '1'";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ)->value;

    }

    /**
     * Delata uma operação
     * @param CashBookEntry $obj
     */
    public function delete(CashBookEntry $obj): void {

        // Monta SQL
        $sql = "CALL CashBookDeleted(:code)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

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
                1452 => new Exception("Algum campo informado é inválido.", 409),
                default => new Exception(checkForErrorInMysql($e), 400),
            };

        }

    }

}
