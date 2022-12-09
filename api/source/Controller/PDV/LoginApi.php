<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Source\Core\ImageBase64;
use Source\Core\Login;
use Exception;
use Source\Core\Token;

class LoginApi extends Login {

    protected int $type = 2;
    protected bool $multiplePassword = true;
    protected ImageBase64 $images;

    /**
     * Monta o token para o usuário
     * @param bool $admin
     * @param object $signature
     * @param string $userName
     * @throws Exception
     */
    protected function tokenGenerate(bool $admin, object $signature, string $userName): void {

        // Configuração das imagens
        $this->images = new ImageBase64(
            $signature->folder,
            [
                ["name" => "logo", "width" => 320]
            ]
        );

        $token = new Token(2);
        $token->setUserName($userName);
        $token->setAdmin($admin);
        $token->setFolder($signature->folder);

        // Renderização da view
        view(200, [
            "token" => $token->encode($token),
            "config" => [
                "admin" => $admin,
                "postSalePrintPagesNumber" => (int) $signature->postSalePrintPagesNumber,
                "requiredSeller" => (((int) $signature->requiredSeller === 0) and ($signature->externalSalesModule)) ? 1 : (int) $signature->requiredSeller,
                "catalogModule" => (bool) $signature->catalogModule,
                "scaleIntegration" => (bool) $signature->scaleIntegration,
                "sellerDeletePayment" => (bool) $signature->sellerDeletePayment,
                "sellerDeleteSale" => (bool) $signature->sellerDeleteSale,
                "useProductImage" => (bool) $signature->useProductImage,
                "sellerSalesReport" => (bool) $signature->sellerSalesReport,
                "useProduction" => $signature->useProduction,
                "selectedAverageCost" => (bool) $signature->selectedAverageCost,
                "requiredCustomerOnSale" => (bool) $signature->requiredCustomerOnSale,
                "calculateStock" => (bool) $signature->calculateStock,
                "sellerDiscount" => (bool) $signature->sellerDiscount,
                "externalSalesModule" => (bool) $signature->externalSalesModule,
                "logo" =>  $this->images->query(null, "logo"),
            ]
        ]);

    }

    /**
     * Renova o ‘login’ do usuário
     * @throws Exception
     */
    public function loginUpToken(): void {

        parent::loginUpToken();

    }

}
