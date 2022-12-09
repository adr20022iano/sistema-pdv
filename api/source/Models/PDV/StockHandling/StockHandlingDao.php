<?php

namespace Source\Models\PDV\StockHandling;

use Exception;
use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Product\ProductDao;
use Source\Models\PDV\Product\ProductFilter;
use Source\Models\PDV\Production\Production;
use Source\Models\PDV\Production\ProductionDao;

class StockHandlingDao {

    /**
     * StockHandlingDao constructor.
     * @param string $userName
     * @param int|null $type
     */
    public function __construct(
        private string $userName,
        protected ?int $type = 2
    ) {}
    
    /**
     * Regista uma nova Movimentação
     * @param StockHandling $obj
     * @throws Exception
     */
    public function create(StockHandling $obj): void {

        // Monta SQL
        $sql = "INSERT INTO stockHandling (productCode, date, history, quantity, type, saleCode, saleValue, cost, oldCost) VALUES
                       (:productCode, Now(), :history, :quantity, :type, :saleCode, :saleValue, :cost, :oldCost)";
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":productCode", $obj->getProductCode(), PDO::PARAM_INT);
        $stmt->bindValue(":history", $obj->getHistory());
        $stmt->bindValue(":quantity", $obj->getQuantity());
        $stmt->bindValue(":type", $obj->getType(), PDO::PARAM_INT);
        $stmt->bindValue(":saleCode", $obj->getSaleCode(), PDO::PARAM_INT);
        $stmt->bindValue(":saleValue", $obj->getSaleValue());
        $stmt->bindValue(":cost", $obj->getCost());
        $stmt->bindValue(":oldCost", $obj->getOldCost());

        self::executeStmt($stmt);

        // Consulta dados do produto
        $product = new ProductFilter();
        $productDao = new ProductDao($this->userName);
        $product->setCode($obj->getProductCode());
        $productData = $productDao->read($product);

        // Verifica se o produto de composição não é um produto de produção
        if (($productData->production) and (($obj->getType() === 1) || ($obj->getType() === 2))) {

            $production = new Production();
            $productionDao = new ProductionDao($this->userName);
            $handling = new StockHandling();
            $handlingDao = new StockHandlingDao($this->userName);

            // Monta objeto
            $production->setProductCode($obj->getProductCode());

            // Monta a lista
            foreach ($productionDao->read($production) as $line) {

                // Verifica o tipo de movimentação
                switch ($obj->getType()) {

                    // Entrada
                    case '1':
                        
                        $handling->setHistory("Enviado para produção");
                        $handling->setQuantity(-abs($line->quantity * $obj->getQuantity()));

                        break;
                    
                    // Saída
                    case '2':
                        
                        $handling->setHistory("Retornou da produção");
                        $handling->setQuantity(abs($line->quantity * $obj->getQuantity()));
                        
                        break;
                }

                // Monta objeto
                $handling->setProductCode($line->compositionProductCode);
                $handling->setType($obj->getType());
                $handlingDao->create($handling);

            }

        }

    }

    /**
     * Consulta as Movimentações do produto
     * @param StockHandlingFilter $obj
     * @return mixed
     */
    public function read(StockHandlingFilter $obj): array {

        // Verifica se usa paginação
        if (!$obj->getPage()) {

            $sqlPage = $obj->getPage() > 0 ? "LIMIT ".(($obj->getPage() * 50) - 50).", 50" : "LIMIT 50";

        } else {
            $sqlPage = null;
        }

        // Monta SQL
        $sql = "SELECT * FROM stockHandling WHERE productCode = :productCode ORDER BY code DESC ".$sqlPage;
        $stmt = Connection::getConn($this->userName)->prepare($sql);
        $stmt->bindValue(":productCode", $obj->getProductCode(), PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

    /**
     * Delata uma Movimentação
     * @param StockHandling $obj
     */
    public function delete(StockHandling $obj): void {

        // Monta SQL e deleta a categoria
        $sql = "DELETE FROM stockHandling WHERE code = :code AND type NOT IN (4,5)";
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
                1452 => new Exception("Produto não localizado.", 404),
                default => new Exception(checkForErrorInMysql($e), 400),
            };

        }

    }

}
