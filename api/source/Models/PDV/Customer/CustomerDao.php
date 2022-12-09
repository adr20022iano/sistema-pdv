<?php

namespace Source\Models\PDV\Customer;

use Exception;
use PDO;
use Source\Core\Connection;
use Source\Models\BaseModels\Customer\CustomerFilter;

class CustomerDao {

    /**
     * CustomerDao constructor.
     * @param string $userName
     */
    public function __construct(
        protected string $userName,
    ) {}

    /**
     * Regista um novo cliente
     * @param Customer $obj
     * @throws Exception
     */
    public function create(Customer $obj): void {

        // Monta SQL
        $sql = "INSERT INTO customer (name, document, phone, cep, city, address, district, number, complement,
                      registerDate, catalogAccess, password, blockedSale, salesRanking, nickname, creditLimit, email, note) VALUES (:name, :document, :phone, :cep, :city, :address, :district,
                        :number, :complement, now(), :catalogAccess, :password, :blockedSale, 0, :nickname, :creditLimit, :email, :note)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::customerData($stmt, $obj);

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * Consulta todos cliente
     * @param CustomerFilter $obj
     * @return array
     */
    public function readAll(CustomerFilter $obj): array {

        // Verifica se usa paginação
        $sqlPage = $obj->getPage() > 0 ? "LIMIT ".(($obj->getPage() * 50) - 50).", 50" : "LIMIT 50";

        // Verifica se filtra por nome
        if (!empty($obj->getName())) {

            // Verifica se vai filtrar por telefone
            if (!preg_match('/[a-zA-Z]/', $obj->getName())) {

                $sqlName = "AND (REPLACE(REPLACE(REPLACE(REPLACE(phone,'-',''),' ',''),')',''),'(','') LIKE REPLACE(REPLACE(REPLACE(REPLACE(:name,'-',''),' ',''),')',''),'(',''))";

            } else {

                $sqlName = "AND (REPLACE(name, ' ', '') LIKE REPLACE(:name, ' ', '') OR REPLACE(nickname, ' ', '') LIKE REPLACE(:name, ' ', ''))";

            }

        } else {

            $sqlName = null;

        }

        // Verifica se filtra por cidade
        $sqlCity = !empty($obj->getFilterCity()) ? "AND city LIKE :city" : null;

        // Verifica se usou algum filtro
        if ((!empty($obj->getName())) || (!empty($obj->getFilterCity())) || (!empty($obj->getSale())) || (!empty($obj->getFilterCatalog()))) {
            $order = "ORDER BY name";
        } else {
            $order = "ORDER BY salesRanking DESC";
        }

        // Verifica filtro por disponibilidade de compra
        $sqlSale = match ($obj->getSale()) {
            1 => "AND blockedSale = false",
            2 => "AND blockedSale = true",
            default => null,
        };

        // Verifica filtro por catálogo
        $sqlCatalog = match ($obj->getFilterCatalog()) {
            1 => "AND catalogAccess = true",
            2 => "AND catalogAccess = false",
            default => null,
        };

        // Verifica se filtra por email
        $sqlEmail = !empty($obj->getFilterEmail()) ? "AND email = :email" : null;

        // Verifica se filtra por eliminação de código
        $sqlCode = !empty($obj->getNotCode()) ? "code != :code" : "code > 0";

        // Verifica se filtra por documento
        $sqlDocument = !empty($obj->getFilterDocument()) ? "AND document = :document" : null;

        // Monta SQL
        $sql = "SELECT 
                    * 
                FROM 
                    customerList 
                WHERE 
                    $sqlCode 
                    $sqlName
                    $sqlCity
                    $sqlSale
                    $sqlCatalog
                    $sqlEmail
                    $sqlDocument
                $order
                $sqlPage
            ";
        $stmt = Connection::getConn($this->userName)->prepare($sql);

        // Verifica se filtra por nome
        if (!empty($obj->getName())) {
            $stmt->bindValue(":name", "%".$obj->getName()."%");
        }

        // Verifica se filtra por cidade
        if (!empty($obj->getFilterCity())) {
            $stmt->bindValue(":city", "%".$obj->getFilterCity()."%");
        }

        // Verifica se filtra por email
        if (!empty($obj->getFilterEmail())) {
            $stmt->bindValue(":email", $obj->getFilterEmail());
        }

        // Verifica se filtra por eliminação de código
        if (!empty($obj->getNotCode())) {
            $stmt->bindValue(":code", $obj->getNotCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por documento
        if (!empty($obj->getFilterDocument())) {
            $stmt->bindValue(":document", $obj->getFilterDocument());
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Consulta os cliente
     * @param CustomerFilter $obj
     * @return object|bool
     */
    public function read(CustomerFilter $obj): object|bool {

        // Monta SQL
        $sql = "SELECT * FROM customerList WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * Atualiza um cliente
     * @param Customer $obj
     * @throws Exception
     */
    public function update(Customer $obj): void {

        // Monta SQL
        $sql = "UPDATE customer SET name = :name, document = :document, phone = :phone, cep = :cep, city = :city, 
                    address = :address, district = :district, number = :number, complement = :complement, catalogAccess = :catalogAccess,
                    password = :password, blockedSale = :blockedSale, nickname = :nickname, creditLimit = :creditLimit, email = :email, note = :note WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::customerData($stmt, $obj);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        self::executeStmt($stmt);

    }

    /**
     * Delata um Contato
     * @param Customer $obj
     */
    public function delete(Customer $obj): void {

        // Monta SQL e deleta o cliente
        $sql = "DELETE FROM customer WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();
 
    }

    /**
     * @param object $stmt
     * @param Customer $obj
     * @return object
     */
    private static function customerData(object $stmt, Customer $obj): object {

        $stmt->bindValue(":name", $obj->getName());
        $stmt->bindValue(":document", $obj->getDocument());
        $stmt->bindValue(":phone", $obj->getPhone());
        $stmt->bindValue(":cep", $obj->getCep());
        $stmt->bindValue(":city", $obj->getCity());
        $stmt->bindValue(":address", $obj->getAddress());
        $stmt->bindValue(":district", $obj->getDistrict());
        $stmt->bindValue(":number", $obj->getNumber());
        $stmt->bindValue(":complement", $obj->getComplement());
        $stmt->bindValue(":catalogAccess", $obj->isCatalogAccess(), PDO::PARAM_BOOL);
        $stmt->bindValue(":password", $obj->getPassword());
        $stmt->bindValue(":blockedSale", $obj->getBlockedSale(), PDO::PARAM_BOOL);
        $stmt->bindValue(":nickname", $obj->getNickname());
        $stmt->bindValue(":creditLimit", $obj->getCreditLimit());
        $stmt->bindValue(":email", $obj->getEmail());
        $stmt->bindValue(":note", $obj->getNote());

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
                1062 => new Exception("Esse cliente já existe.", 409),
                default => new Exception(checkForErrorInMysql($e), 400),
            };

        }

    }

}
