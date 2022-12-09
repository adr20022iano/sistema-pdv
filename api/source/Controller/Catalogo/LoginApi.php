<?php  /** @noinspection PhpUnused */

namespace Source\Controller\Catalogo;

use Exception;
use Source\Core\Token;
use Source\Models\BaseModels\Customer\CustomerFilter;
use Source\Models\BaseModels\Signature\SignatureDao;
use Source\Models\Catalogo\Customer\CustomerDao;

class LoginApi {

    private Token $token;
    private SignatureDao $signatureDao;
    protected CustomerFilter $customerFilter;
    protected CustomerDao $customerDao;
    private object $signature;

    /**
     * BootstrapApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(6);
        $this->token->decode(apache_request_headers());

        $this->customerFilter = new CustomerFilter();
        $this->customerDao = new CustomerDao($this->token->getUserName());

        // Consulta assinatura
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
        $this->signature = $this->signatureDao->read();

        // Verifica contratação do módulo de catálogo
        if (!$this->signature->catalogModule) {

            trueExceptionCatalogModule();

        }

    }

    /**
     * @throws Exception
     */
    public function login(): void {

        // Consulta assinatura & Verifica contratação do módulo de catálogo
        if (!$this->signature->catalogModule) {

            trueExceptionCatalogModule();

        }

        // Recebe input
        $jsonObj = json_decode(file_get_contents('php://input'));

        // Verifica se está em produção
        if (PROD) {
            recaptcha($jsonObj->recaptcha, $this->signature->privateKey);
        }

        // Converte para minúsculo
        $email = strtolower($jsonObj->email);

        // Monta objeto
        $this->customerFilter->setFilterEmail($email);
        $customerData = $this->customerDao->read($this->customerFilter);

        // Verifica se tem resultado & Verifica se o cliente tem acesso ao catálogo
        // Senha é segura & Senha esta correta
        if (
            ((!empty($customerData)) and ($customerData->catalogAccess)) and
            ((safePassword($jsonObj->password)) and (password_verify($jsonObj->password, $customerData->password)))
        ) {

            // Renderização da view
            view(201, [
                "customerName" => !empty($customerData->nickname) ? $customerData->nickname : $customerData->name,
                "token" => $this->tokenGenerate($this->token->getUserName(), $this->token->getFolder(), $customerData->code)
            ]);

        } else {

            trueExceptionLogin();

        }

    }

    /**
     * Monta o token para o catálogo
     * @param string $userName
     * @param string $folder
     * @param int $CustomerCode
     * @return string
     * @throws Exception
     */
    private function tokenGenerate(string $userName, string $folder, int $CustomerCode): string {

        $token = new Token(6);
        $token->setUserName($userName);
        $token->setFolder($folder);
        $token->setCustomerCode($CustomerCode);

        return $token->encode($token);

    }

}
