<?php

namespace Source\Models\BaseModels\Signature;

use PDO;
use Source\Core\Connection;
use Exception;

class SignatureDao {

    /**
     * Signature constructor.
     * @param string $userName
     * @param int $system
     * @throws Exception
     */
    public function __construct(
        protected string $userName,
        protected int $system
    ) {}

    /**
     * @return object
     */
    public function read(): object {

        $sql = "SELECT * FROM signatureSettings WHERE code = '1'";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * Atualiza números de erros na senha
     */
    public function UpErrorPassword(): void {

        // Monta SQL
        $sql = "CALL upErrorPassword()";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->execute();

    }

}
