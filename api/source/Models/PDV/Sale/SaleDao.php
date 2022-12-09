<?php

namespace Source\Models\PDV\Sale;

use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Product\ProductDao;
use Source\Models\PDV\Product\ProductFilter;
use Source\Models\PDV\Sale\Enum\PaymentStatus;

class SaleDao {

    /**
     * @param string $userName
     */
    public function __construct(
        private readonly string $userName,
    ) {}

    /**
     * @param Sale $obj
     */
    public function create(Sale $obj): void {

        // Inicia transação
        Connection::getConn($this->userName)->beginTransaction();

        // Monta SQL
        $sql = <<<SQL
                INSERT INTO sale (
                    customerCode, 
                    date, 
                    discount, 
                    productsValue, 
                    paidValue, 
                    sellerCode, 
                    observation, 
                    productsCost, 
                    cash, 
                    credit, 
                    debit, 
                    others, 
                    saleChange, 
                    shipping, 
                    origin, 
                    locked
                ) VALUES (
                    :customerCode, 
                    Now(), 
                    :discount, 
                    0, 
                    0, 
                    :sellerCode, 
                    :observation, 
                    0, 
                    0, 
                    0, 
                    0, 
                    0, 
                    :saleChange, 
                    :shipping, 
                    :origin, 
                    false
                )
        SQL;
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleChange", $obj->getSaleChange());
        $stmt->bindValue(":origin", $obj->getOrigin(), PDO::PARAM_INT);
        $stmt = self::saleData($stmt, $obj);
        $stmt->execute();

        // Código da venda
        $obj->setCode(Connection::getConn($this->userName)->lastInsertId());

        // Adiciona produtos na venda
        self::addProductToSale($obj);

        // Confirma transação
        Connection::getConn($this->userName)->commit();

    }

    /**
     * @param SaleFilter $obj
     * @return array
     * @noinspection DuplicatedCode
     */
    public function readAll(SaleFilter $obj): array {

        // Verifica se usa paginação
        if (!$obj->getNoPagination()) {

            $sqlPage = $obj->getPage() > 0 ? "LIMIT ".(($obj->getPage() * 50) - 50).", 50" : "LIMIT 50";

        } else {
            $sqlPage = null;
        }

        // Verifica se filtra por cliente
        $sqlCustomer = !empty($obj->getCustomerCode()) ? "AND customerCode = :customer" : null;

        // Verifica se filtra por cod ou OBS
        $sqlObservation = !empty($obj->getCodeObservation()) ? "AND (code = :code OR observation LIKE :observation)" : null;

        // Verifica se filtra por data
        $sqlDate = !empty($obj->getDate()) ? "AND DATE(date) = :date" : null;

        // Verifica o tipo de filtro a ser usado
        if (!empty($obj->getPaymentStatus())) {

            $sqlPaymentStatus = match (PaymentStatus::from($obj->getPaymentStatus())) {
                PaymentStatus::Paid => "AND paidValue = ((ROUND(productsValue, 2) + ROUND(shipping, 2)) - ROUND(discount, 2))",
                PaymentStatus::Overpaid => "AND paidValue > ((ROUND(productsValue, 2) + ROUND(shipping, 2)) - ROUND(discount, 2))",
                PaymentStatus::PartiallyPaid => "AND paidValue < ((ROUND(productsValue, 2) + ROUND(shipping, 2)) - ROUND(discount, 2))",
            };

        } else {

            $sqlPaymentStatus = null;

        }

        // Verifica se filtra por origem
        $sqlOrigin = $obj->getOrigin() !== null ? "AND origin = :origin" : null;

        // Verifica se filtra por bloqueio
        $sqlLocked = match ($obj->getLocked()) {
            1 => "AND locked = false AND origin = 2",
            2 => "AND locked = true AND origin = 2",
            default => null,
        };

        // Verifica se filtra por vendedor
        $sqlSeller = !empty($obj->getSellerCode()) ? "AND sellerCode = :sellerCode" : null;

        // Verifica se filtra por códigos
        $sqlCodes = !empty($obj->getCodes()) ? "AND code IN (".str_repeat('?,', count($obj->getCodes()) - 1) . '?'.")" : null;

        // Verifica se filtra por valor
        $sqlValue = $obj->getValue() !== null ? "AND ((productsValue + shipping) - discount) = ROUND(:value, 2)" : null;

        // Monta SQL
        $sql = <<<SQL
                SELECT
                    *
                FROM
                    saleList
                WHERE 
                    code > 0
                    $sqlCodes
                    $sqlCustomer
                    $sqlObservation
                    $sqlDate
                    $sqlPaymentStatus
                    $sqlOrigin
                    $sqlLocked
                    $sqlSeller
                    $sqlValue
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

        // Verifica se filtra por valor
        if ($obj->getValue() !== null) {
            $stmt->bindValue(":value", $obj->getValue());
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
        // Adicionado para melhorar a segurança do (Força) de Vendas
        $sqlSeller = !empty($obj->getSellerCode()) ? "AND sellerCode = :sellerCode" : null;

        // Verifica se filtra por cliente
        // Adicionado para melhorar a segurança no catalog
        $sqlCustomer = !empty($obj->getCustomerCode()) ? "AND customerCode = :customer" : null;

        // Monta SQL
        $sql = <<<SQL
                SELECT
                    *
                FROM
                    saleList
                WHERE 
                    code = :code
                    $sqlCustomer
                    $sqlSeller
        SQL;

        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        // Verifica se filtra por cliente
        if (!empty($obj->getCustomerCode())) {
            $stmt->bindValue(":customer", $obj->getCustomerCode(), PDO::PARAM_INT);
        }

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
    public function readProdutosSale(SaleFilter $obj): array {

        // Verifica se filtra por categoria
        $sqlCategory = !empty($obj->getCategoryCode()) ? "AND categoryCode = :categoryCode" : null;

        // Monta SQL
        $sql = <<<SQL
            SELECT 
                *
            FROM 
                saleProductsList
            WHERE
                saleCode = :code
                $sqlCategory
        SQL;
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);

        // Verifica se filtra por categoria
        if (!empty($obj->getCategoryCode())) {
            $stmt->bindValue(":categoryCode", $obj->getCategoryCode(), PDO::PARAM_INT);
        }

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
                    sale
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
        $stmt = self::saleData($stmt, $obj);
        $stmt->execute();

        // Monta SQL e deleta a movimentação
        $sql = "DELETE FROM stockHandling WHERE saleCode = :saleCode";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleCode", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

        // Monta SQL e deleta os produtos
        $sql = "DELETE FROM saleProducts WHERE saleCode = :saleCode";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleCode", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

        // Adiciona produtos na venda
        self::addProductToSale($obj);

        // Confirma transação
        Connection::getConn($this->userName)->commit();

    }

    /**
     * Atualiza o bloqueio da venda
     * @param Sale $obj
     */
    public function updateLocked(Sale $obj): void {

        // Monta SQL
        $sql = "UPDATE sale SET locked = :locked WHERE code = :code";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->bindValue(":locked", $obj->getLocked(), PDO::PARAM_BOOL);
        $stmt->execute();

    }

    /**
     * @param Sale $obj
     */
    public function delete(Sale $obj): void {

        // Monta SQL e deleta
        $sql = "CALL SaleDeleted(:code)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":code", $obj->getCode(), PDO::PARAM_INT);
        $stmt->execute();

    }

    /**
     * Adiciona os produtos da venda
     * @param Sale $obj
     */
    private function addProductToSale(Sale $obj): void {

        // Monta SQL
        $sql = "INSERT INTO saleProducts (productCode, saleCode, quantity, value, cost) VALUES (:productCode, :saleCode, ABS(:quantity), :value, :cost)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":saleCode", $obj->getCode(), PDO::PARAM_INT);

        // Adiciona os dados
        foreach ($obj->getProducts() as $line) {

            // Consulta dados do produto
            $product = new ProductFilter();
            $productDao = new ProductDao($this->userName);
            $product->setCode($line->code);
            $productData = $productDao->read($product);

            // Trata os dados
            $stmt->bindValue(":productCode", $line->code, PDO::PARAM_INT);
            $stmt->bindValue(":quantity", $line->quantity);
            $stmt->bindValue(":value", $line->value);
            $stmt->bindValue(":cost", $productData->cost);
            $stmt->execute();

        }

    }

    /**
     * @param object $stmt
     * @param Sale $obj
     * @return object
     */
    private static function saleData(object $stmt, Sale $obj): object {

        $stmt->bindValue(":customerCode", $obj->getCustomerCode(), PDO::PARAM_INT);
        $stmt->bindValue(":discount", $obj->getDiscount());
        $stmt->bindValue(":sellerCode", $obj->getSellerCode(), PDO::PARAM_INT);
        $stmt->bindValue(":observation", $obj->getObservation());
        $stmt->bindValue(":shipping", $obj->getShipping());

        return $stmt;

    }

}
