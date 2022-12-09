<?php

namespace Source\Models\ForcaVendas;

use Source\Models\BaseModels\Signature\SignatureDao;
use Source\Models\PDV\Seller\Seller;
use Source\Models\PDV\Seller\SellerDao;
use Exception;

class Authentication {

    /**
     * Authentication constructor.
     * @throws Exception
     */
    public function __construct(
        private string $userName,
        private int $sellerCode,
    ) {

        // Consulta assinatura
        $signatureDao = new SignatureDao($this->userName, 2);

        // Verifica contratou o módulo de força de vendas
        if (!$signatureDao->read()->externalSalesModule) {

            trueExceptionExternalSalesModule();

        }

        // Consulta se existe o vendedor informado
        $seller = new Seller();
        $sellerDao = new SellerDao($this->userName);

        $seller->setCode($this->sellerCode);
        $sellerData = $sellerDao->read($seller);

        if (!$sellerData) {

            trueExceptionLogin();

        }

    }

}
