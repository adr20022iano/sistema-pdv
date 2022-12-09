<?php

namespace Source\Models\PDV\Product;

use Exception;
use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Product\Enum\CatalogSale;
use Source\Models\PDV\Product\Enum\Production;
use Source\Models\PDV\Product\Enum\Sale;
use Source\Models\PDV\Product\Enum\TypeCode;

class ProductDao {

    /**
     * @param string $userName
     * @param int|null $type
     */
    public function __construct(
        protected string $userName,
        protected ?int $type = 2
    ) {}

    /**
     * @param Product $obj
     * @throws Exception
     */
    public function create(Product $obj): void {
  
        // Monta SQL
        $sql = "INSERT INTO product (barCode, name, categoryCode, stock, value, cost, scaleDate, shelfLife, unit, production, 
                     sale , location, level, deleted, catalogSale, details, catalogDetails, externalSaleValue) VALUES (:barCode, :name, :categoryCode, 0, :value, :cost, :scaleDate, 
                                                            :shelfLife, :unit, :production, :sale, :location, 0, false, :catalogSale, :details, :catalogDetails, :externalSaleValue)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::productData($stmt, $obj);
        $stmt->bindValue(":production", $obj->getProduction(), PDO::PARAM_BOOL);

        self::executeStmt($stmt);

        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

    }

    /**
     * @param ProductFilter $obj
     * @return array
     */
    public function readAll(ProductFilter $obj): array {

        // Verifica se usa paginação
        if (!$obj->getNoPagination()) {

            $sqlPage = $obj->getPage() > 0 ? "LIMIT ".(($obj->getPage() * 50) - 50).", 50" : "LIMIT 50";

        } else {
            $sqlPage = null;
        }


        // Verifica se filtra por nome exato
        $sqlExactName = !empty($obj->getExactName()) ? "AND name = :exactName" : null;

        // Verifica se filtra
        $sqlName = !empty($obj->getName()) ? "AND (code = :code OR barCode LIKE :barCode OR name LIKE :name OR categoryName LIKE :name)" : null;

        // Verifica se filtra por categoria
        $sqlCategory = !empty($obj->getCategoryCode()) ? "AND categoryCode = :categoryCode" : null;

        // Verifica se filtra por catálogo
        if (!empty($obj->getCatalogSale())) {

            $sqlCatalogSale = match (CatalogSale::from($obj->getCatalogSale())) {
                CatalogSale::True => "AND catalogSale = true",
                CatalogSale::False => "AND catalogSale = false",
            };

        } else {

            $sqlCatalogSale = null;

        }

        // Verifica se filtra por produção
        if (!empty($obj->getProduction())) {

            $sqlProduction = match (Production::from($obj->getProduction())) {
                Production::True => "AND production = true",
                Production::False => "AND production = false",
            };

        } else {

            $sqlProduction = null;

        }

        // Verifica se filtra por venda
        if (!empty($obj->getSale())) {

            $sqlSale = match (Sale::from($obj->getSale())) {
                Sale::True => "AND sale = true",
                Sale::False => "AND sale = false",
            };

        } else {

            $sqlSale = null;

        }

        // Verifica se usou algum filtro
        if ((!empty($obj->getCategoryCode())) || (!empty($obj->getName())) || (!empty($obj->getSale())) || (!empty($obj->getCodes())) || (!empty($obj->getCatalogSale()))) {
            $order = "ORDER BY name ASC";
        } else {
            $order = "ORDER BY level DESC";
        }

        // Verifica se filtra por eliminação de código
        $sqlNotCode = !empty($obj->getNotCode()) ? "AND code != :code" : null;

        // Verifica se filtra por códigos
        $sqlCodes = !empty($obj->getCodes()) ? "AND code IN (".str_repeat('?,', count($obj->getCodes()) - 1) . '?'.")" : null;

        // Monta SQL
        $sql = <<<SQL
            SELECT 
                * 
            FROM 
                productList 
            WHERE 
                deleted = false
                $sqlNotCode
                $sqlCodes
                $sqlExactName
                $sqlName
                $sqlCategory
                $sqlProduction
                $sqlSale
                $sqlCatalogSale
            $order 
            $sqlPage
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);

        // Verifica se filtra por nome exato
        if (!empty($obj->getExactName())) {
            $stmt->bindValue(":exactName", $obj->getExactName());
        }

        // Verifica se filtra
        if (!empty($obj->getName())) {
            $stmt->bindValue(":code", $obj->getName(), PDO::PARAM_INT);
            $stmt->bindValue(":barCode", $obj->getName()."%");
            $stmt->bindValue(":name", "%".$obj->getName()."%");
        }

        // Verifica se filtra por categoria
        if (!empty($obj->getCategoryCode())) {
            $stmt->bindValue(":categoryCode", $obj->getCategoryCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por eliminação de código
        if (!empty($obj->getNotCode())) {
            $stmt->bindValue(":code", $obj->getNotCode(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute($obj->getCodes());

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Consulta os produtos
     * @param ProductFilter $obj
     * @return object|bool
     */
    public function read(ProductFilter $obj): object|bool {

        // Verifica tipo da busca
        $sql = match (TypeCode::from($obj->getTypeCode())) {
            TypeCode::Code => "SELECT * FROM productList WHERE code = :code",
            TypeCode::BarCode => "SELECT * FROM productList WHERE barCode = :code",
        };

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * @param Product $obj
     * @throws Exception
     */
    public function update(Product $obj): void {

        // Monta SQL
        $sql = <<<SQL
            UPDATE 
                product 
            SET 
                barCode = :barCode, 
                name = :name, 
                categoryCode = :categoryCode, 
                value = :value,
                cost = :cost, 
                scaleDate = :scaleDate, 
                shelfLife = :shelfLife, 
                unit = :unit, 
                sale = :sale, 
                location = :location,
                catalogSale = :catalogSale, 
                details = :details, 
                catalogDetails = :catalogDetails, 
                externalSaleValue = :externalSaleValue 
            WHERE 
                code = :code
        SQL;
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt = self::productData($stmt, $obj);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        self::executeStmt($stmt);

    }

    /**
     * Atualiza o preço do produto
     * @param Product $obj
     */
    public function updateValue(Product $obj): void {

        // Monta SQL
        $sql = "UPDATE product SET value = :value WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->bindValue(":value", $obj->getValue());
        $stmt->execute();

    }

    /**
     * @param Product $obj
     * @throws Exception
     */
    public function delete(Product $obj): void {

        // Monta SQL
        $sql = "UPDATE product SET deleted = true, barCode = NULL, level = 0 WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

    }

    /**
     * Atualiza o custo do produto
     * @param Product $obj
     */
    public function costUp(Product $obj): void {

        // Monta SQL
        $sql = "UPDATE product SET cost = :cost WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->bindValue(":cost", $obj->getCost());
        $stmt->execute();

    }

    /**
     * @param object $stmt
     * @param Product $obj
     * @return object
     * @throws Exception
     */
    private static function productData(object $stmt, Product $obj): object {

        $stmt->bindValue(":barCode", $obj->getBarCode(), PDO::PARAM_INT);
        $stmt->bindValue(":name", $obj->getName());
        $stmt->bindValue(":categoryCode", $obj->getCategoryCode(), PDO::PARAM_INT);
        $stmt->bindValue(":value", $obj->getValue());
        $stmt->bindValue(":cost", $obj->getCost());
        $stmt->bindValue(":scaleDate", $obj->getScaleDate(), PDO::PARAM_INT);
        $stmt->bindValue(":shelfLife", $obj->getShelfLife());
        $stmt->bindValue(":unit", $obj->getUnit());
        $stmt->bindValue(":sale", $obj->getSale(), PDO::PARAM_BOOL);
        $stmt->bindValue(":location", $obj->getLocation());
        $stmt->bindValue(":catalogSale", $obj->getCatalogSale(), PDO::PARAM_BOOL);
        $stmt->bindValue(":details", $obj->getDetails());
        $stmt->bindValue(":catalogDetails", $obj->getCatalogDetails());
        $stmt->bindValue(":externalSaleValue", $obj->getExternalSaleValue());

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
                1062 => new Exception("Código de barras já está cadastrado.", 409),
                default => new Exception(checkForErrorInMysql($e), 400),
            };

        }

    }

}
