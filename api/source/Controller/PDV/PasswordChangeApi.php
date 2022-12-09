<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Signature\Signature;
use Source\Models\PDV\Signature\SignatureDao;

class PasswordChangeApi {

    private Token $token;
    private ?object $obj;
    private Signature $signature;
    private SignatureDao $signatureDao;

    /**
     * passwordChangeApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->signature = new Signature();
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);
    
    }

    /**
     * @throws Exception
     */
    public function seller(): void {

        // Monta objeto
        $this->signature->setPassword($this->safePassword($this->obj->password));
        $this->signatureDao->updatePassword($this->signature);

        // Renderização da view
        view(204);

    }

    /**
     * @param string $password
     * @return string|null
     * @throws Exception
     */
    private function safePassword(string $password): ?string {

        if (!safePassword($password)) {
            throw new Exception("Essa senha não é segura ou muito pequena. Ela deve conter letras e números", 409);
        }

        return $password;

    }

}
