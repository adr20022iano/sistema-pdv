<?php

namespace Source\Models\PDV\SalePayment;

use Exception;
use PDO;
use Source\Core\Connection;

class SalePaymentDao {

    /**
     * SalePaymentDao constructor.
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * Regista um novo pagamento
     * @param SalePayment $obj
     * @throws Exception
     */
    public function create(SalePayment $obj): void {

        // Monta SQL
        $sql = "INSERT INTO salePayment (saleCode, value, type, date) VALUES (:saleCode, :value, :type, Now())";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleCode", $obj->getSaleCode(), PDO::PARAM_INT);
        $stmt->bindValue(":value", $obj->getValue());
        $stmt->bindValue(":type", $obj->getType(), PDO::PARAM_INT);

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * Consulta os pagamentos
     * @param SalePayment $obj
     * @return array
     */
    public function read(SalePayment $obj): array {

        // Monta SQL
        $sql = "SELECT * FROM salePayment WHERE saleCode = :saleCode";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleCode", $obj->getSaleCode(), PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Delata um pagamento
     * @param SalePayment $obj
     */
    public function delete(SalePayment $obj): void {

        // Monta SQL e deleta a Conta
        $sql = "CALL SalePaymentDeleted(:code)";
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
