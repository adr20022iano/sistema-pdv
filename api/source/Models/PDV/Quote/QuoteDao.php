<?php

namespace Source\Models\PDV\Quote;

use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Sale\Sale;
use Source\Models\PDV\Sale\SaleFilter;

class QuoteDao {

    /**
     * @param string $userName
     */
    public function __construct(
        private string $userName,
    ) {}

    /**
     * @param Sale $obj
     */
    public function create(Sale $obj): void {

        // Inicia transação
        Connection::getConn($this->userName)->beginTransaction();

        // Monta SQL
        $sql = <<<SQL
                INSERT INTO quote (
                    customerCode, 
                    date, 
                    discount, 
                    productsValue, 
                    sellerCode, 
                    observation, 
                    shipping, 
                    origin
                ) VALUES (
                    :customerCode, 
                    Now(), 
                    :discount, 
                    0, 
                    :sellerCode, 
                    :observation, 
                    :shipping, 
                    :origin
                )
        SQL;
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":origin", $obj->getOrigin(), PDO::PARAM_INT);
        $stmt = self::quoteData($stmt, $obj);
        $stmt->execute();

        // Código da venda
        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

        // Adiciona produtos no orçamento
        self::addProductToSale($obj);

        // Confirma transação
        Connection::getConn($this->userName)->commit();

    }

    /**
     * @param SaleFilter $obj
     * @return array
     */
    public function readAll(SaleFilter $obj): array {

        // Verifica se usa paginação
        $sqlPage = $obj->getPage() > 0 ? "LIMIT ".(($obj->getPage() * 50) - 50).", 50" : "LIMIT 50";

        // Verifica se filtra por cliente
        $sqlCustomer = !empty($obj->getCustomerCode()) ? "AND customerCode = :customer" : null;

        // Verifica se filtra por cod ou OBS
        $sqlObservation = !empty($obj->getCodeObservation()) ? "AND (code = :code OR observation LIKE :observation)" : null;

        // Verifica se filtra por data
        $sqlDate = !empty($obj->getDate()) ? "AND DATE(date) = :date" : null;

        // Verifica se filtra por origem
        $sqlOrigin = $obj->getOrigin() !== null ? "AND origin = :origin" : null;

        // Verifica se filtra por vendedor
        $sqlSeller = !empty($obj->getSellerCode()) ? "AND sellerCode = :sellerCode" : null;

        // Monta SQL
        $sql = <<<SQL
                SELECT
                    *
                FROM
                    quoteList
                WHERE 
                    code > 0
                    $sqlCustomer
                    $sqlObservation
                    $sqlDate
                    $sqlOrigin
                    $sqlSeller
                $sqlPage
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);

        // Verifica se filtra por cliente
        if (!empty($obj->getCustomerCode())) {
            $stmt->bindValue(":customer", $obj->getCustomerCode(), PDO::PARAM_INT);
        }

        // Verifica se filtra por cod ou Obs
        if (!empty($obj->getCodeObservation())) {
            $stmt->bindValue(":code", $obj->getCodeObservation(), PDO::PARAM_INT);
            $stmt->bindValue(":observation", "%".$obj->getCodeObservation()."%");
        }

        // Verifica se filtra por data
        if (!empty($obj->getDate())) {
            $stmt->bindValue(":date", $obj->getDate());
        }

        // Verifica se filtra por origem
        if ($obj->getOrigin() !== null) {
            $stmt->bindValue(":origin", $obj->getOrigin(), PDO::PARAM_INT);
        }

        // Verifica se filtra por vendedor
        if (!empty($obj->getSellerCode())) {
            $stmt->bindValue(":sellerCode", $obj->getSellerCode(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute($obj->getCodes());

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * @param SaleFilter $obj
     * @return object|bool
     */
    public function read(SaleFilter $obj): object|bool {

        // Verifica se filtra por vendedor
        // Adicionado para melhorar a segurança do Força de Vendas
        $sqlSeller = !empty($obj->getSellerCode()) ? "AND sellerCode = :sellerCode" : null;

        // Monta SQL
        $sql = <<<SQL
                SELECT
                    *
                FROM
                    quoteList
                WHERE 
                    code = :code
                    $sqlSeller
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        // Verifica se filtra por vendedor
        if (!empty($obj->getSellerCode())) {
            $stmt->bindValue(":sellerCode", $obj->getSellerCode(), PDO::PARAM_INT);
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_OBJ);

    }

    /**
     * @param SaleFilter $obj
     * @return array
     */
    public function readProdutosQuote(SaleFilter $obj): array {

        // Monta SQL
        $sql = <<<SQL
            SELECT 
                *
            FROM 
                quoteProductsList
            WHERE
                quoteCode = :code
        SQL;
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * @param Sale $obj
     */
    public function update(Sale $obj): void {

        // Inicia transação
        Connection::getConn($this->userName)->beginTransaction();

        // Monta SQL
        $sql = <<<SQL
                UPDATE 
                    quote
                SET 
                    customerCode = :customerCode, 
                    discount = :discount, 
                    sellerCode = :sellerCode, 
                    observation = :observation, 
                    shipping = :shipping
                WHERE 
                    code = :code
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt = self::quoteData($stmt, $obj);
        $stmt->execute();

        // Monta SQL e deleta os produtos
        $sql = "DELETE FROM quoteProducts WHERE quoteCode = :quoteCode";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":quoteCode", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

        // Adiciona produtos na venda
        self::addProductToSale($obj);

        // Confirma transação
        Connection::getConn($this->userName)->commit();

    }

    /**
     * @param SaleFilter $obj
     */
    public function delete(SaleFilter $obj): void {

        // Verifica se filtra por vendedor
        // Adicionado para melhorar a segurança do Força de Vendas
        $sqlSeller = !empty($obj->getSellerCode()) ? "AND sellerCode = :sellerCode" : null;

        // Monta SQL e deleta
        $sql = "DELETE FROM quote WHERE code = :code $sqlSeller";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        // Verifica se filtra por vendedor
        if (!empty($obj->getSellerCode())) {
            $stmt->bindValue(":sellerCode", $obj->getSellerCode(), PDO::PARAM_INT);
        }


        $stmt->execute();

    }

    /**
     * Adiciona os produtos da venda
     * @param Sale $obj
     */
    private function addProductToSale(Sale $obj): void {

        // Monta SQL
        $sql = "INSERT INTO quoteProducts (productCode, quoteCode, quantity, value) VALUES (:productCode, :quoteCode, ABS(:quantity), :value)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":quoteCode", $obj->getCode(), PDO::PARAM_INT);

        // Adiciona os dados
        foreach ($obj->getProducts() as $line) {

            // Trata os dados
            $stmt->bindValue(":productCode", $line->code, PDO::PARAM_INT);
            $stmt->bindValue(":quantity", $line->quantity);
            $stmt->bindValue(":value", $line->value);
            $stmt->execute();

        }

    }

    /**
     * @param object $stmt
     * @param Sale $obj
     * @return object
     */
    private static function quoteData(object $stmt, Sale $obj): object {

        $stmt->bindValue(":customerCode", $obj->getCustomerCode(), PDO::PARAM_INT);
        $stmt->bindValue(":discount", $obj->getDiscount());
        $stmt->bindValue(":sellerCode", $obj->getSellerCode(), PDO::PARAM_INT);
        $stmt->bindValue(":observation", $obj->getObservation());
        $stmt->bindValue(":shipping", $obj->getShipping());

        return $stmt;

    }

}
