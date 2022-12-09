<?php

require __DIR__."/../vendor/autoload.php";

use CoffeeCode\Router\Router;

// Rotas
try {

    // Controllers e Rotas
    $router = new Router(BASE_URL);

    /**
     * *****************************************************************************************************************
     */

    // Catálogo
    $router->group("catalogo");
    $router->namespace("Source\Controller\Catalogo");

    // login
    $router->post("/login", "LoginApi:login");

    // bootstrap
    $router->get("/bootstrap", "BootstrapApi:read");
    $router->get("/bootstrapProduct", "BootstrapProductApi:read");

    // product
    $router->get("/product", "ProductApi:readAll");

    // sale
    $router->post("/sale", "SaleApi:create");
    $router->get("/sale", "SaleApi:readAll");
    $router->get("/sale/{code}", "SaleApi:read");

    // shopCart
    $router->get("/shopCart", "ShopCartApi:read");

    /**
     * *****************************************************************************************************************
     */

    // Módulo Força de vendas
    $router->group("forcaVendas");
    $router->namespace("Source\Controller\ForcaVendas");

    customer($router);
    cnpjQuery($router);
    sale($router);
    quote($router);

    // login
    $router->post("/login", "LoginApi:login");

    // product
    $router->get("/product", "ProductApi:readAll");

    // productCategory
    $router->get("/productCategory", "ProductCategoryApi:read");

    // salePayment
    $router->get("/salePayment/{saleCode}", "SalePaymentApi:read");

    /**
     * *****************************************************************************************************************
     */

    // PDV
    $router->group("pdv");
    $router->namespace("Source\Controller\PDV");

    login($router);
    customer($router);
    product($router);
    productCategory($router);
    cnpjQuery($router);
    stockHandling($router);
    reports($router);
    quote($router);

    // bookCategory
    $router->post("/bookCategory", "BookCategoryApi:create");
    $router->get("/bookCategory", "BookCategoryApi:read");
    $router->patch("/bookCategory", "BookCategoryApi:update");
    $router->delete("/bookCategory/{code}", "BookCategoryApi:delete");

    // cashBookEntry
    $router->post("/cashBookEntry", "CashBookEntryApi:create");
    $router->get("/cashBookEntry/{date}", "CashBookEntryApi:readAll");
    $router->delete("/cashBookEntry/{code}", "CashBookEntryApi:delete");

    // customer
    $router->delete("/customer/{code}", "CustomerApi:delete");

    // passwordChange
    $router->patch("/sellerPasswordChange", "PasswordChangeApi:seller");

    // priceUpdate
    $router->patch("/priceUpdate", "PriceUpdateApi:update");

    // production
    $router->post("/production", "ProductionApi:create");
    $router->get("/production/{productCode}", "ProductionApi:read");

    // salePayment
    $router->post("/salePayment", "SalePaymentApi:create");
    $router->get("/salePayment/{saleCode}", "SalePaymentApi:read");
    $router->delete("/salePayment/{code}", "SalePaymentApi:delete");

    // multipleSalesPaymentApi
    $router->post("/multipleSalesPayment", "MultipleSalesPaymentApi:create");

    //sale
    sale($router);
    $router->patch("/saleLocked", "SaleApi:updateLocked");

    // seller
    $router->post("/seller", "SellerApi:create");
    $router->get("/seller", "SellerApi:readAll");
    $router->patch("/seller", "SellerApi:update");
    $router->delete("/seller/{code}", "SellerApi:delete");

    // settings
    $router->get("/companyDetails", "CompanyDetailsApi:read");
    $router->patch("/companyDetails", "CompanyDetailsApi:update");
    $router->get("/systemBehavior", "SystemBehaviorApi:read");
    $router->patch("/systemBehavior", "SystemBehaviorApi:update");
    $router->get("/sellerPermissions", "SellerPermissionsApi:read");
    $router->patch("/sellerPermissions", "SellerPermissionsApi:update");
    $router->get("/systemResources", "SystemResourcesApi:read");
    $router->patch("/systemResources", "SystemResourcesApi:update");
    $router->get("/systemCatalog", "SystemCatalogApi:read");
    $router->patch("/systemCatalog", "SystemCatalogApi:update");

    // passwordSettings
    $router->post("/supervisorAuth", "passwordSettingsApi:read");
    $router->get("/passwordSettings", "passwordSettingsApi:readAll");
    $router->patch("/passwordSettings", "passwordSettingsApi:update");

    // scalesProduct
    $router->get("/scalesProduct", "ScalesProductApi:read");

    /**
     * REPOSTS
     */

    // CashBookReport
    $router->post("/reports/cashBook", "CashBookReportApi:read");

    // SaleReport
    $router->post("/reports/sale", "SaleReportApi:read");

    // SaleProductReport
    $router->post("/reports/saleProduct", "SaleProductReportApi:read");

    // SalePayment
    $router->post("/reports/salePayment", "SalePaymentReportApi:read");

    /**
     * *****************************************************************************************************************
     */

    // Dispara a rota
    $router->dispatch();

    // Verifica se houve erro na rota
    if ($router->error()) {

        // Verifica se está em produção
        if (PROD) {

            header ("location: https://www.devap.com.br/404");

        } else {

            throw new Exception("Ocorreu um erro na rota.", $router->error());

        }

    }

} catch(Exception $e) {

    if (is_int($e->getCode())) {
        http_response_code($e->getCode());
    } else {
        http_response_code(500);
    }

    echo json_encode(["msg" => $e->getMessage()],256);

}

/**
 * *****************************************************************************************************************
 */

/**
 * Login
 */
function login(object $router): object {

    $router->post("/login", "LoginApi:login");
    $router->patch("/login", "LoginApi:loginUpToken");

    return $router;

}

/**
 * Customer
 */
function customer(object $router): object {

    $router->post("/customer", "CustomerApi:create");
    $router->get("/customer", "CustomerApi:readAll");
    $router->get("/customer/{code}", "CustomerApi:read");
    $router->patch("/customer", "CustomerApi:update");

    return $router;

}

/**
 * Product
 */
function product(object $router): object {

    $router->post("/product", "ProductApi:create");
    $router->get("/product", "ProductApi:readAll");
    $router->get("/product/{type}/{code}", "ProductApi:read");
    $router->patch("/product", "ProductApi:update");
    $router->delete("/product/{code}", "ProductApi:delete");

    return $router;

}

/**
 * StockHandling
 */
function stockHandling(object $router): object {

    $router->post("/stockHandling", "StockHandlingApi:create");
    $router->get("/stockHandling/{page}/{productCode}", "StockHandlingApi:read");
    $router->delete("/stockHandling/{code}", "StockHandlingApi:delete");

    return $router;

}

/**
 * Product Category
 */
function productCategory(object $router): object {

    $router->post("/productCategory", "ProductCategoryApi:create");
    $router->get("/productCategory", "ProductCategoryApi:read");
    $router->patch("/productCategory", "ProductCategoryApi:update");
    $router->delete("/productCategory/{code}", "ProductCategoryApi:delete");

    return $router;

}

/**
 * CNPJ Query
 */
function cnpjQuery(object $router): object {

    $router->get("/cnpjQuery/{cnpj}", "CnpjQueryApi:read");

    return $router;

}

/**
 * Reports
 */
function reports(object $router): object {

    // ProductReport
    $router->post("/reports/product", "ProductReportApi:read");

    // StockHandlingReport
    $router->post("/reports/stockHandling", "StockHandlingReportApi:read");

    return $router;

}

/**
 * Sale
 */
function sale(object $router): object {

    $router->post("/sale", "SaleApi:create");
    $router->get("/sale", "SaleApi:readAll");
    $router->get("/sale/{code}", "SaleApi:read");
    $router->patch("/sale", "SaleApi:update");
    $router->delete("/sale/{code}", "SaleApi:delete");

    return $router;

}

/**
 * Quote
 */
function quote(object $router): object {

    $router->post("/quote", "QuoteApi:create");
    $router->get("/quote", "QuoteApi:readAll");
    $router->get("/quote/{code}", "QuoteApi:read");
    $router->patch("/quote", "QuoteApi:update");
    $router->delete("/quote/{code}", "QuoteApi:delete");

    return $router;

}
