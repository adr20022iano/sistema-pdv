<?php  /** @noinspection PhpUnused */

namespace Source\Controller\ForcaVendas;

use Exception;
use JetBrains\PhpStorm\Pure;
use Source\Core\Token;
use Source\Models\PDV\Seller\Seller;
use Source\Models\PDV\Seller\SellerDao;
use Source\Models\PDV\Signature\SignatureDao;
use Source\Core\Connection;

class LoginApi {

    private Seller $seller;

    /**
     * LoginApi constructor.
     */
    #[Pure] public function __construct() {

        $this->seller = new Seller();

    }

    /**
     * Monta o token para o usuário
     * @param int $sellerCode
     * @param object $signature
     * @param string $userName
     * @throws Exception
     */
    private function tokenGenerate(int $sellerCode, object $signature, string $userName): void {

        $token = new Token(7);
        $token->setUserName($userName);
        $token->setSellerCode($sellerCode);
        $token->setFolder($signature->folder);

        // Renderização da view
        view(200, [
            "token" => $token->encode($token),
            "config" => [
                "useProductImage" => (bool) $signature->useProductImage,
                "calculateStock" => (bool) $signature->calculateStock,
                "sellerDiscount" => (bool) $signature->sellerDiscount,
                "sellerDeleteSale" => (bool) $signature->sellerDeleteSale
            ]
        ]);

    }

    /**
     * @throws Exception
     */
    public function login(): void {

        // Recebe input
        $jsonObj = json_decode(file_get_contents('php://input'));

        // Verifica se está em produção
        if (PROD) {
            recaptcha($jsonObj->recaptcha);
        }

        // Converte para minúsculo
        $userName = strtolower($jsonObj->userName);

        // Verifica dados informados
        if ((!empty($jsonObj->externalSalesCode)) and (substr_count($jsonObj->externalSalesCode, "-") === 3) and (Connection::getConn($userName))) {

            // Consulta assinatura
            $signatureDao = new SignatureDao($userName, 2);
            $signatureData = $signatureDao->read();

            // Verifica contratou o módulo de força de vendas
            if (!$signatureData->externalSalesModule) {

                trueExceptionExternalSalesModule();

            } else {

                // Monta objeto
                $this->seller->setExternalSalesCode($jsonObj->externalSalesCode);
                $sellerDao = new SellerDao($userName);
                $line = $sellerDao->readExternal($this->seller);

                // Verifica se tem resultado
                if ($line) {

                    $this->tokenGenerate($line->code, $signatureData, $userName);

                } else {

                    trueExceptionLogin();

                }

            }

        } else {

            trueExceptionLogin();

        }

    }

}
