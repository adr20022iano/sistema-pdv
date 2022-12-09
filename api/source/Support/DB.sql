CREATE TABLE IF NOT EXISTS `signature` (
    `code` INT AUTO_INCREMENT,
    `password` varchar(255) DEFAULT NULL,
    `saleObservation` varchar(255) DEFAULT NULL,
    `name` varchar(255) DEFAULT NULL,
    `fantasyName` varchar(255) DEFAULT NULL,
    `city` varchar(255) DEFAULT NULL,
    `district` varchar(255) DEFAULT NULL,
    `cep` char(9) DEFAULT NULL,
    `address` varchar(255) DEFAULT NULL,
    `number` varchar(255) DEFAULT NULL,
    `complement` varchar(255) DEFAULT NULL,
    `phone` char(15) DEFAULT NULL,
    `requiredSeller` int(1) NOT NULL,
    `folder` char(50) UNIQUE NOT NULL,
    `postSalePrintPagesNumber` int(1) NOT NULL,
    `document` varchar(255) DEFAULT NULL,
    `scaleIntegration` tinyint NOT NULL,
    `couponMarginRight` int(11) NOT NULL,
    `couponMarginLeft` int(11) NOT NULL,
    `useProductImage` tinyint NOT NULL,
    `sellerDeletePayment` tinyint NOT NULL,
    `sellerDeleteSale` tinyint NOT NULL,
    `sellerSalesReport` tinyint NOT NULL,
    `useProduction` tinyint NOT NULL,
    `selectedAverageCost` tinyint NOT NULL,
    `requiredCustomerOnSale` tinyint NOT NULL,
    `calculateStock` tinyint NOT NULL,
    `sellerDiscount` tinyint NOT NULL,
    `email` varchar(255) DEFAULT NULL,
    `signatureCode` int(11) NOT NULL,
    `showPriceOnCatalogAfterLogin` tinyint NOT NULL,
    `receiptType` int(1) NOT NULL COMMENT '1 A4, 2 A4_2, 3 Cupom 58mm, 4 Cupom 80mm',
    PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO signature(
    code,
    password,
    saleObservation,
    name,
    fantasyName,
    city,
    district,
    cep,
    address,
    number,
    complement,
    phone,
    requiredSeller,
    folder,
    postSalePrintPagesNumber,
    document,
    scaleIntegration,
    couponMarginRight,
    couponMarginLeft,
    useProductImage,
    sellerDeletePayment,
    sellerDeleteSale,
    sellerSalesReport,
    useProduction,
    selectedAverageCost,
    requiredCustomerOnSale,
    calculateStock,
    sellerDiscount,
    email,
    signatureCode,
    showPriceOnCatalogAfterLogin,
    receiptType
)VALUES(
    1,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    CONVERT(NOW(), SIGNED),
    0,
    NULL,
    false,
    5,
    0,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    null,
    207,
    false,
    1
);

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `category` (
    `code` INT AUTO_INCREMENT,
    `name` varchar(255) UNIQUE NOT NULL,
    `type` int(1) NOT NULL COMMENT '1 = Despesa, 2 = Receita',
    PRIMARY KEY (`code`),
    INDEX (type)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

INSERT INTO category VALUES
    (1, 'Vendas', 2),
    (2, 'Despesas Diversas', 1)
;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `customer` (
    `code` INT AUTO_INCREMENT,
    `name` varchar(255) UNIQUE NOT NULL,
    `document` varchar(255) DEFAULT NULL,
    `phone` char(15) DEFAULT NULL,
    `cep` char(9) DEFAULT NULL,
    `city` varchar(255) DEFAULT NULL,
    `address` varchar(255) DEFAULT NULL,
    `district` varchar(255) DEFAULT NULL,
    `number` varchar(255) DEFAULT NULL,
    `complement` varchar(255) DEFAULT NULL,
    `registerDate` datetime NOT NULL,
    `catalogAccess` tinyint NOT NULL,
    `password` varchar(255) DEFAULT NULL,
    `blockedSale` tinyint NOT NULL,
    `salesRanking` decimal(11,3) NOT NULL,
    `nickname` varchar(255) DEFAULT NULL,
    `creditLimit` decimal(11,3) DEFAULT NULL,
    `email` varchar(255) DEFAULT NULL,
    `note` text DEFAULT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `seller` (
    `code` INT AUTO_INCREMENT,
    `name` varchar(255) UNIQUE NOT NULL,
    `externalSalesCode` varchar(50) DEFAULT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `cashBook` (
    `code` INT AUTO_INCREMENT,
    `value` decimal(11,3) NOT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

INSERT INTO cashBook VALUES (1, 0);

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `cashBookEntry` (
    `code` INT AUTO_INCREMENT,
    `categoryCode` int(11) DEFAULT NULL,
    `value` decimal(11,3) NOT NULL,
    `date` datetime NOT NULL,
    `history` varchar(255) NOT NULL,
    `salePaymentCode` int(11) DEFAULT NULL,
    `saleCode` int(11) DEFAULT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `sale` (
    `code` INT AUTO_INCREMENT,
    `customerCode` int(11) DEFAULT NULL,
    `date` datetime NOT NULL,
    `discount` decimal(11,3) NOT NULL,
    `productsValue` decimal(11,3) NOT NULL,
    `paidValue` decimal(11,3) NOT NULL,
    `sellerCode` int(11) DEFAULT NULL,
    `observation` varchar(255) DEFAULT NULL,
    `productsCost` decimal(11,3) NOT NULL,
    `cash` decimal(11,3) NOT NULL,
    `credit` decimal(11,3) NOT NULL,
    `debit` decimal(11,3) NOT NULL,
    `others` decimal(11,3) NOT NULL,
    `saleChange` decimal(11,3) NOT NULL,
    `shipping` decimal(11,3) NOT NULL,
    `origin` int(1) NOT NULL COMMENT '0 = Lite PDV, 1 = Catalogo, 2 = Força de vendas',
    `locked` tinyint NOT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `salePayment` (
     `code` INT AUTO_INCREMENT,
     `saleCode` int(11) NOT NULL,
     `value` decimal(11,3) NOT NULL,
     `type` int(1) NOT NULL COMMENT '1 = Dinheiro, 2 = Cartão crédito, 3 = Cartão débito, 4 =  Outros',
     `date` datetime NOT NULL,
     PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `productCategory` (
    `code` INT AUTO_INCREMENT,
    `name` varchar(255) UNIQUE NOT NULL,
    `favorite` tinyint NOT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `product` (
    `code` INT AUTO_INCREMENT,
    `barCode` char(14) UNIQUE DEFAULT NULL,
    `name` varchar(255) NOT NULL,
    `categoryCode` int(11) DEFAULT NULL,
    `stock` decimal(11,3) NOT NULL,
    `value` decimal(11,3) NOT NULL,
    `cost` decimal(11,3) NOT NULL,
    `scaleDate` int(1) DEFAULT NULL COMMENT '1 = Validade do produto, 2 = Solicitar validade na balança, 3 = Data da pesagem + 30 dias, 4 = Data da pesagem + 60 dias, 5 = Data da pesagem + 90 dias',
    `shelfLife` date DEFAULT NULL,
    `unit` char(5) NOT NULL,
    `production` tinyint NOT NULL,
    `sale` tinyint NOT NULL,
    `location` varchar(100) DEFAULT NULL,
    `level` int(11) NOT NULL,
    `deleted` tinyint NOT NULL,
    `catalogSale` tinyint NOT NULL,
    `details` text DEFAULT NULL,
    `catalogDetails` text DEFAULT NULL,
    `externalSaleValue` decimal(11,3) DEFAULT NULL,
    PRIMARY KEY (`code`),
    INDEX (production),
    INDEX (deleted),
    INDEX (sale),
    INDEX (catalogSale)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `saleProducts` (
    `code` INT AUTO_INCREMENT,
    `productCode` int(11) NOT NULL,
    `saleCode` int(11) NOT NULL,
    `quantity` decimal(11,3) NOT NULL,
    `value` decimal(11,3) NOT NULL,
    `cost` decimal(11,3) NOT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `quote` (
    `code` INT AUTO_INCREMENT,
    `customerCode` int(11) DEFAULT NULL,
    `date` datetime NOT NULL,
    `discount` decimal(11,3) NOT NULL,
    `productsValue` decimal(11,3) NOT NULL,
    `sellerCode` int(11) DEFAULT NULL,
    `observation` varchar(255) DEFAULT NULL,
    `shipping` decimal(11,3) NOT NULL,
    `origin` int(1) NOT NULL COMMENT '0 = Lite PDV, 2 = Força de vendas',
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `quoteProducts` (
    `code` INT AUTO_INCREMENT,
    `productCode` int(11) NOT NULL,
    `quoteCode` int(11) NOT NULL,
    `quantity` decimal(11,3) NOT NULL,
    `value` decimal(11,3) NOT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `stockHandling` (
    `code` INT AUTO_INCREMENT,
    `productCode` int(11) NOT NULL,
    `date` datetime NOT NULL,
    `history` varchar(255) DEFAULT NULL,
    `quantity` decimal(11,3) NOT NULL,
    `type` int(1) NOT NULL COMMENT '1 = Entrada, 2 = Saída, 3 = Perda, 4 = Venda, 5 = Produção, 6 = Transferência',
    `saleCode` int(11) DEFAULT NULL,
    `saleValue` decimal(11,3) NOT NULL,
    `cost` decimal(11,3) NOT NULL,
    `oldCost` decimal(11,3) NOT NULL,
    PRIMARY KEY (`code`),
    INDEX (type)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE IF NOT EXISTS `production` (
    `code` INT AUTO_INCREMENT,
    `productCode` int(11) NOT NULL,
    `compositionProductCode` int(11) NOT NULL,
    `quantity` decimal(11,3) NOT NULL,
    PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;

-- #################################### FOREIGN KEY #########################################

ALTER TABLE `cashBookEntry` ADD FOREIGN KEY (categoryCode) REFERENCES category(code);
ALTER TABLE `cashBookEntry` ADD FOREIGN KEY (salePaymentCode) REFERENCES salePayment(code);
ALTER TABLE `cashBookEntry` ADD FOREIGN KEY (saleCode) REFERENCES sale(code);

ALTER TABLE `sale` ADD FOREIGN KEY (customerCode) REFERENCES customer(code);
ALTER TABLE `sale` ADD FOREIGN KEY (sellerCode) REFERENCES seller(code);

ALTER TABLE `salePayment` ADD FOREIGN KEY (saleCode) REFERENCES sale(code);

ALTER TABLE `product` ADD FOREIGN KEY (categoryCode) REFERENCES productCategory(code);

ALTER TABLE `saleProducts` ADD FOREIGN KEY (productCode) REFERENCES product(code);
ALTER TABLE `saleProducts` ADD FOREIGN KEY (saleCode) REFERENCES sale(code);

ALTER TABLE `stockHandling` ADD FOREIGN KEY (productCode) REFERENCES product(code);
ALTER TABLE `stockHandling` ADD FOREIGN KEY (saleCode) REFERENCES sale(code);

ALTER TABLE `production` ADD FOREIGN KEY (productCode) REFERENCES product(code);
ALTER TABLE `production` ADD FOREIGN KEY (compositionProductCode) REFERENCES product(code);

ALTER TABLE `quote` ADD FOREIGN KEY (sellerCode) REFERENCES seller(code) ON DELETE CASCADE;
ALTER TABLE `quote` ADD FOREIGN KEY (customerCode) REFERENCES customer(code) ON DELETE CASCADE;

ALTER TABLE `quoteProducts` ADD FOREIGN KEY (productCode) REFERENCES product(code);
ALTER TABLE `quoteProducts` ADD FOREIGN KEY (quoteCode) REFERENCES quote(code) ON DELETE CASCADE;

-- ########################################## View #########################################

CREATE VIEW calculatedCost AS
SELECT
    a.code,
    a.name,
    FLOOR(
            IFNULL(
                    IF ((c.cost * b.quantity) < 0, 0, (c.cost * b.quantity))
                , 0)
        ) AS calculatedCost
FROM
    product a
        LEFT JOIN production b ON b.productCode = a.code
        LEFT JOIN product c ON c.code = b.compositionProductCode
WHERE
        a.production = true;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW calculatedStock AS
SELECT
    a.code,
    a.name,
    FLOOR(
            IFNULL(
                    IF ((c.stock / b.quantity) < 0, 0, (c.stock / b.quantity))
                , 0)
        ) AS calculatedStock
FROM
    product a
        LEFT JOIN production b ON b.productCode = a.code
        LEFT JOIN product c ON c.code = b.compositionProductCode
WHERE
        a.production = true;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW bootstrapProductCategory AS
SELECT
    a.categoryCode,
    b.name,
    COUNT(a.categoryCode) AS categoriesTotal
FROM
    product a
        LEFT JOIN productCategory b ON a.categoryCode = b.code
WHERE
    a.sale = true
    AND a.catalogSale = true
    AND a.categoryCode IS NOT null
    AND a.stock > 0
GROUP BY a.categoryCode
HAVING categoriesTotal >= 4
ORDER BY
    RAND()
LIMIT 4;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW bootstrapProduct AS
SELECT
    a.code,
    a.name,
    a.stock,
    a.value,
    a.unit,
    a.categoryCode,
    a.catalogDetails,
    b.name AS categoryName
FROM
    product a
        LEFT JOIN productCategory b ON a.categoryCode = b.code
WHERE
    a.sale = true
    AND a.catalogSale = true
    AND a.categoryCode IS NOT null
    AND a.stock > 0;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW productReport AS
SELECT
    a.*,
    b.name AS categoryName
FROM
    product a
        LEFT JOIN productCategory b ON a.categoryCode = b.code
WHERE
        a.production = false;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW productionSummaryList AS
SELECT
    a.code,
    a.name,
    a.unit,
    IF(a.production,
       IF (((SELECT COUNT(b.productCode) FROM production b WHERE b.productCode = a.code) = 1),
           (SELECT c.unit FROM product c WHERE c.code = (SELECT b.compositionProductCode FROM production b WHERE b.productCode = a.code))
           , null)
        , null) AS compositionUnit,
    IF(a.production,
       IF (((SELECT COUNT(b.productCode) FROM production b WHERE b.productCode = a.code) = 1),
           (SELECT c.quantity FROM production c WHERE c.productCode = a.code)
           , null)
        , null) AS compositionQuantity
FROM
    product a;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW productList AS
SELECT
    a.*,
    IF(a.production, (SELECT MIN(calculatedStock) FROM calculatedStock WHERE code = a.code), a.stock) AS calculatedStock,
    IF(a.production, (SELECT MIN(calculatedCost) FROM calculatedCost WHERE code = a.code), a.cost) AS calculatedCost,
    b.name AS categoryName,
    c.compositionQuantity,
    c.compositionUnit
FROM
    product a
        LEFT JOIN productCategory b ON a.categoryCode = b.code
        LEFT JOIN productionSummaryList c ON a.code = c.code;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW stockHandlingReport AS
SELECT
    a.*,
    b.name AS productName,
    b.unit
FROM
    stockHandling a,
    product b
WHERE
        b.code = a.productCode
ORDER BY a.date;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW cashBookReport AS
SELECT
    a.*,
    b.name AS categoryName
FROM
    cashBookEntry a,
    category b
WHERE
    b.code = a.categoryCode
ORDER BY a.date;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW cashBookForSaleReport AS
SELECT
    a.*,
    d.customerCode,
    d.sellerCode
FROM
    cashBookEntry a
        LEFT JOIN sale d ON a.saleCode = d.code;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW saleReport AS
SELECT
    a.*,
    b.name AS customerName
FROM
    sale a
        LEFT JOIN customer b ON a.customerCode = b.code
ORDER BY
    a.code DESC;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW paymentReport AS
SELECT
    a.*,
    b.customerCode,
    c.name AS customerName
FROM
    salePayment a,
    sale b
        LEFT JOIN customer c ON b.customerCode = c.code
WHERE
        a.saleCode = b.code;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW cashBookEntryList AS
SELECT
    a.*,
    b.name AS categoryName
FROM
    cashBookEntry a
        LEFT JOIN category b ON b.code = a.categoryCode
ORDER BY
    a.date;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW productionList AS
SELECT
    a.*,
    b.name,
    b.unit,
    b.value
FROM
    production a,
    product b
WHERE
        a.compositionProductCode = b.code
ORDER BY b.name;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW customerList AS
SELECT
    a.*,
    IFNULL(
            (
                SELECT
                    SUM((b.productsValue + b.shipping) - (b.discount + b.paidValue))
                FROM
                    sale b
                WHERE
                        b.customerCode = a.code
                  AND ((b.productsValue + b.shipping) - (b.discount + b.paidValue)) > 0
            )
        ,0) AS debt
FROM
    customer a;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW saleList AS
SELECT
    a.*,
    b.name AS customerName,
    b.nickname AS customerNickname,
    b.city,
    b.address,
    b.district,
    b.number,
    b.complement,
    b.document,
    b.phone,
    b.debt,
    c.name AS sellerName
FROM
    sale a
        LEFT JOIN customerList b ON a.customerCode = b.code
        LEFT JOIN seller c ON a.sellerCode = c.code
ORDER BY
    a.code DESC;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW quoteList AS
SELECT
    a.*,
    b.name AS customerName,
    b.nickname AS customerNickname,
    b.city,
    b.address,
    b.district,
    b.number,
    b.complement,
    b.document,
    c.name AS sellerName
FROM
    quote a
        LEFT JOIN customer b ON a.customerCode = b.code
        LEFT JOIN seller c ON a.sellerCode = c.code
ORDER BY
    a.code DESC;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW saleProductsList AS
SELECT
    a.*,
    b.name,
    b.unit,
    b.barCode,
    b.categoryCode,
    c.name AS categoryName
FROM
    saleProducts a,
    product b
        LEFT JOIN productCategory c ON b.categoryCode = c.code
WHERE
        b.code = a.productCode
ORDER BY b.name;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW quoteProductsList AS
SELECT
    a.*,
    b.name,
    b.unit,
    b.barCode,
    b.categoryCode,
    c.name AS categoryName
FROM
    quoteProducts a,
    product b
        LEFT JOIN productCategory c ON b.categoryCode = c.code
WHERE
        b.code = a.productCode
ORDER BY b.name;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE VIEW saleProductReport AS
SELECT
    a.*,
    b.customerCode,
    b.date,
    b.sellerCode,
    c.name,
    c.barCode,
    c.unit
FROM
    saleProducts a
        LEFT JOIN sale b ON a.saleCode = b.code
        LEFT JOIN product c ON a.productCode = c.code
ORDER BY
    c.name;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# noinspection SqlResolve
CREATE VIEW signatureSettings AS
SELECT
    a.*,
    b.blocked,
    c.errorPassword,
    c.password AS adminPassword,
    (d.code IS NOT NULL) AS catalogModule,
    d.privateKey,
    (e.code IS NOT NULL) AS externalSalesModule
FROM
    signature a
        LEFT JOIN painel.signature b ON b.code = a.signatureCode
        LEFT JOIN painel.customer c ON c.code = b.customerCode
        LEFT JOIN painel.litepdvCatalogApi d ON d.signatureCode = b.code
        LEFT JOIN painel.signature e ON e.extendSignature = b.code;

-- ######################################## Trigger ########################################

DELIMITER $
CREATE TRIGGER removeProductCategory BEFORE DELETE ON productCategory
    FOR EACH ROW
BEGIN
    UPDATE product SET categoryCode = null WHERE categoryCode = OLD.code;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER removeCategory BEFORE DELETE ON category
    FOR EACH ROW
BEGIN
    UPDATE cashBookEntry SET categoryCode = null WHERE categoryCode = OLD.code;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER addProductStock AFTER INSERT ON stockHandling
    FOR EACH ROW
BEGIN
    UPDATE product SET stock = (stock + NEW.quantity), level = (level + 1) WHERE code = NEW.productCode;
END$

CREATE TRIGGER subProductStock AFTER DELETE ON stockHandling
    FOR EACH ROW
BEGIN
    UPDATE product SET stock = (stock - OLD.quantity), level = (level - 1) WHERE code = OLD.productCode;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER sumValue AFTER INSERT ON cashBookEntry
    FOR EACH ROW
BEGIN
    UPDATE cashBook SET value = (value + NEW.value) WHERE code = 1;
END$

CREATE TRIGGER subValue AFTER DELETE ON cashBookEntry
    FOR EACH ROW
BEGIN
    UPDATE cashBook SET value = (value - OLD.value) WHERE code = 1;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER removeSaleCustomer BEFORE DELETE ON customer
    FOR EACH ROW
BEGIN
    UPDATE sale SET customerCode = null WHERE customerCode = OLD.code;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER removeSaleSeller BEFORE DELETE ON seller
    FOR EACH ROW
BEGIN
    UPDATE sale SET sellerCode = null WHERE sellerCode = OLD.code;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER addProductToSale AFTER INSERT ON saleProducts
    FOR EACH ROW
BEGIN

    DECLARE isProduction TINYINT DEFAULT false;
    DECLARE qQuantity decimal(11,3);
    DECLARE qCompositionProductCode int(11);
    DECLARE done TINYINT DEFAULT false;
    DECLARE cur CURSOR FOR SELECT quantity, compositionProductCode FROM production WHERE productCode = NEW.productCode;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = true;

    SET isProduction = (SELECT production FROM product WHERE code = NEW.productCode);

    -- Verifica se e de produção
    IF isProduction THEN

        OPEN cur;

        read_loop: LOOP

            FETCH cur INTO qQuantity, qCompositionProductCode;

            SET qQuantity = (NEW.quantity * qQuantity);

            IF done THEN
                LEAVE read_loop;
            END IF;

            INSERT INTO stockHandling (code, productCode, date, history, quantity, type, saleCode, saleValue, cost, oldCost) VALUES
                (NULL, qCompositionProductCode, Now(), CONCAT('Venda cod:', ' ', NEW.saleCode), -ABS(qQuantity), '4', NEW.saleCode, NEW.value, 0, 0);

        END LOOP;

        CLOSE cur;

    ELSE

        INSERT INTO stockHandling (code, productCode, date, history, quantity, type, saleCode, saleValue, cost, oldCost) VALUES
            (NULL, NEW.productCode, Now(), CONCAT('Venda cod:', ' ', NEW.saleCode), -ABS(NEW.quantity), '4', NEW.saleCode, NEW.value, 0, 0);

    END IF;

    UPDATE sale SET
                    productsValue = (productsValue + (NEW.quantity * NEW.value)),
                    productsCost = (productsCost + (NEW.quantity * NEW.cost))
    WHERE code = NEW.saleCode;

END$

CREATE TRIGGER removeProductFromSale AFTER DELETE ON saleProducts
    FOR EACH ROW
BEGIN
    UPDATE sale SET
                    productsValue = (productsValue - (OLD.quantity * OLD.value)),
                    productsCost = (productsCost - (OLD.quantity * OLD.cost))
    WHERE code = OLD.saleCode;

    DELETE FROM stockHandling WHERE productCode = OLD.productCode AND saleCode = OLD.saleCode;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER addProductToQuote AFTER INSERT ON quoteProducts
    FOR EACH ROW
BEGIN
    UPDATE quote SET
                    productsValue = (productsValue + (NEW.quantity * NEW.value))
    WHERE code = NEW.quoteCode;
END$

CREATE TRIGGER removeProductFromQuote AFTER DELETE ON quoteProducts
    FOR EACH ROW
BEGIN
    UPDATE quote SET
                    productsValue = (productsValue - (OLD.quantity * OLD.value))
    WHERE code = OLD.quoteCode;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE TRIGGER sumSalePayment AFTER INSERT ON salePayment
    FOR EACH ROW
BEGIN

    declare saleCustomer int(11);

    SET saleCustomer = (SELECT customerCode FROM sale WHERE code = NEW.saleCode);

    -- Verifica se tem cliente
    IF saleCustomer THEN

        UPDATE customer SET salesRanking = (salesRanking + NEW.value) WHERE code = saleCustomer;

    END IF;

    -- Atualiza o pedido
    UPDATE sale SET paidValue = (paidValue + NEW.value) WHERE code = NEW.saleCode;

    -- Dinheiro
    IF NEW.type = 1 THEN

        UPDATE sale SET cash = (cash + NEW.value) WHERE code = NEW.saleCode;

        INSERT INTO cashBookEntry (categoryCode, value, date, history, salePaymentCode, saleCode) VALUES
        (1, NEW.value, NEW.date, CONCAT('Recebimento da venda cod:', ' ', NEW.saleCode), NEW.code, NEW.saleCode);

    END IF;

    -- Cartão crédito
    IF NEW.type = 2 THEN

        UPDATE sale SET credit = (credit + NEW.value) WHERE code = NEW.saleCode;

    END IF;

    -- Cartão débito
    IF NEW.type = 3 THEN

        UPDATE sale SET debit = (debit + NEW.value) WHERE code = NEW.saleCode;

    END IF;

    -- Outros
    IF NEW.type = 4 THEN

        UPDATE sale SET others = (others + NEW.value) WHERE code = NEW.saleCode;

    END IF;
END$

CREATE TRIGGER subSalePayment AFTER DELETE ON salePayment
    FOR EACH ROW
BEGIN

    declare saleCustomer int(11);

    SET saleCustomer = (SELECT customerCode FROM sale WHERE code = OLD.saleCode);

    -- Verifica se tem cliente
    IF saleCustomer THEN

        UPDATE customer SET salesRanking = (salesRanking - OLD.value) WHERE code = saleCustomer;

    END IF;

    -- Verifica se removeu todos os pagamentos para remover o registro de troco
    IF (SELECT COUNT(value) FROM salePayment WHERE saleCode = OLD.saleCode) THEN

        UPDATE sale SET paidValue = (paidValue - OLD.value) WHERE code = OLD.saleCode;

    ELSE

        UPDATE sale SET paidValue = (paidValue - OLD.value), saleChange = 0 WHERE code = OLD.saleCode;

    END IF;

    -- Dinheiro
    IF OLD.type = 1 THEN

        UPDATE sale SET cash = (cash - OLD.value) WHERE code = OLD.saleCode;

    END IF;

    -- Cartão crédito
    IF OLD.type = 2 THEN

        UPDATE sale SET credit = (credit - OLD.value) WHERE code = OLD.saleCode;

    END IF;

    -- Cartão débito
    IF OLD.type = 3 THEN

        UPDATE sale SET debit = (debit - OLD.value) WHERE code = OLD.saleCode;

    END IF;

    -- Outros
    IF OLD.type = 4 THEN

        UPDATE sale SET others = (others - OLD.value) WHERE code = OLD.saleCode;

    END IF;

END$
DELIMITER ;

-- ###################################### Procedure #########################################

DELIMITER $
CREATE PROCEDURE SaleDeleted(deletedSaleCode int)
BEGIN
    DELETE FROM cashBookEntry WHERE saleCode = deletedSaleCode;
    DELETE FROM salePayment WHERE saleCode = deletedSaleCode;
    DELETE FROM stockHandling WHERE saleCode = deletedSaleCode;
    DELETE FROM saleProducts WHERE saleCode = deletedSaleCode;
    DELETE FROM sale WHERE code = deletedSaleCode;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE PROCEDURE CashBookDeleted(deletedCashBookCode int)
BEGIN

    declare deletedSalePaymentCode int(11);

    SET deletedSalePaymentCode = (SELECT salePaymentCode FROM cashBookEntry WHERE code = deletedCashBookCode);

    DELETE FROM cashBookEntry WHERE code = deletedCashBookCode;
    DELETE FROM salePayment WHERE code = deletedSalePaymentCode;

END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE PROCEDURE SalePaymentDeleted(deletedSalePaymentCode int)
BEGIN
    DELETE FROM cashBookEntry WHERE salePaymentCode = deletedSalePaymentCode;
    DELETE FROM salePayment WHERE code = deletedSalePaymentCode;
END$
DELIMITER ;

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

DELIMITER $
CREATE PROCEDURE UpErrorPassword()
BEGIN

    DECLARE sCode int(11);
    DECLARE cCode int(11);

    -- Coleta dados da assinatura
    SET sCode = (SELECT signatureCode FROM signatureSettings WHERE code = 1);

    -- Coleta dados do cliente
    # noinspection SqlResolve
    SET cCode = (SELECT customerCode FROM painel.signature WHERE code = sCode);

    -- Atualiza erros da senha
    # noinspection SqlResolve
    UPDATE painel.customer SET errorPassword = errorPassword + 1 WHERE code = cCode;

END$
DELIMITER ;
