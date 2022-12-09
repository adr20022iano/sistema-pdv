<?php

namespace Source\Models\Catalogo\Customer;

use Source\Models\PDV\Customer\CustomerDao AS CustomerDaoPDV;
use PDO;
use Source\Core\Connection;
use Source\Models\BaseModels\Customer\CustomerFilter;

class CustomerDao extends CustomerDaoPDV {

    /**
     * Consulta os cliente
     * @param CustomerFilter $obj
     * @return object|bool
     */
    public function read(CustomerFilter $obj): object|bool {

        // Monta SQL
        $sql = "SELECT * FROM customer WHERE email = :email";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":email", $obj->getFilterEmail());
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ);

    }

}
