<?php

namespace Source\Models\PDV\Product;

use PDO;
use Source\Core\Connection;
use Source\Models\PDV\Product\Enum\CatalogSale;
use Source\Models\PDV\Product\Enum\ReportOrderType;
use Source\Models\PDV\Product\Enum\Sale;

class ProductReportDao {

    /**
     * ProductReportDao constructor.
     * @param string $userName
     * @param int|null $type
     */
    public function __construct(
        private readonly string $userName,
        protected ?int $type = 2
    ) {}

    /**
     * Consulta os produtos
     * @param ProductReport $obj
     * @return array
     */
    public function read(ProductReport $obj): array {

        // Verifica o tipo da ordem
        $sqlOrderDesc = $obj->getOrderDesc() ? "DESC" : null;
        $sqlStockDesc = $obj->getStockFilterAsc() ? ">=" : "<=";

        // Verifica se filtra por quantidade de estoque
        $sqlStockFilter = is_numeric($obj->getStockFilter()) ? "AND stock ".$sqlStockDesc." :stockFilter" : null;

        // Verifica o tipo da ordem
        if (!empty($obj->getOrderBy())) {

            $order = match (ReportOrderType::from($obj->getOrderBy())) {
                ReportOrderType::Code => "ORDER BY code " . $sqlOrderDesc,
                ReportOrderType::Stock => "ORDER BY stock " . $sqlOrderDesc,
                ReportOrderType::Cost => "ORDER BY cost " . $sqlOrderDesc,
                ReportOrderType::Value => "ORDER BY value " . $sqlOrderDesc,
            };

        } else {

            $order = "ORDER BY name " . $sqlOrderDesc;

        }

        // Verifica se filtra por catálogo
        if (!empty($obj->getCatalogSale())) {

            $sqlCatalogSale = match (CatalogSale::from($obj->getCatalogSale())) {
                CatalogSale::True => "AND catalogSale = true",
                CatalogSale::False => "AND catalogSale = false",
            };

        } else {

            $sqlCatalogSale = null;

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

        // Verifica se filtra por categoria
        if (!empty($obj->getCategoryCode()) and count($obj->getCategoryCode()) > 0) {
            $sqlCategoryCode = "AND categoryCode IN (".implode(",", $obj->getCategoryCode()).")";
        } else {
            $sqlCategoryCode = null;
        }

        // Monta SQL
        $sql = "SELECT 
                * 
            FROM 
                productReport 
            WHERE 
                deleted = false
                $sqlStockFilter
                $sqlCatalogSale
                $sqlCategoryCode
                $sqlSale
            $order
        ";

        $stmt = Connection::getConn($this->userName)->prepare($sql);

        // Verifica se filtra por categoria
        if (is_numeric($obj->getStockFilter())) {
            $stmt->bindValue(":stockFilter", $obj->getStockFilter());
        }

        // Executa a consulta
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_OBJ);

    }

}
