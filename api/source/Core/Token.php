<?php

namespace Source\Core;

use Ahc\Jwt\JWT;
use Ahc\JwT\JWTException;
use Exception;
use DateTime;

class Token {

    private ?string $userName = null;
    private ?bool $admin = false;
    private ?string $folder = null;
    private ?int $customerCode = null;
    private ?int $sellerCode = null;
    private ?string $customerName = null;
    private DateTime $date;

    /**
     * Token constructor.
     * @param int $type
     * 2 Lite PDV
     * 6 Catálogo
     * 7 Módulo Força
     * 8 Central
     * @throws Exception
     */
    public function __construct(
        private readonly int $type
    ) {

        $this->date = new DateTime(date('Y-m-d H:i:s'));

    }

    // Padrão de codificação do json web token
    const JWT = "RS256";
    
    // Parâmetros do openssl
    const METHOD = "AES-256-CBC";
    const OPTIONS = "0";
    const IV = "T19724146413g7r4";

    /**
     * @return string|null
     */
    public function getUserName(): ?string {
        return $this->userName;
    }

    /**
     * @param string|null $userName
     */
    public function setUserName(?string $userName): void {
        $this->userName = $userName;
    }

    /**
     * @return bool|null
     */
    public function getAdmin(): ?bool {
        return $this->admin;
    }

    /**
     * @param bool|null $admin
     */
    public function setAdmin(?bool $admin): void {
        $this->admin = $admin;
    }

    /**
     * @return string|null
     */
    public function getFolder(): ?string {
        return $this->folder;
    }

    /**
     * @param string|null $folder
     */
    public function setFolder(?string $folder): void {
        $this->folder = $folder;
    }

    /**
     * @return int|null
     */
    public function getCustomerCode(): ?int {
        return $this->customerCode;
    }

    /**
     * @param int|null $customerCode
     */
    public function setCustomerCode(?int $customerCode): void {
        $this->customerCode = $customerCode;
    }

    /**
     * @return string|null
     */
    public function getCustomerName(): ?string {
        return $this->customerName;
    }

    /**
     * @param string|null $customerName
     */
    public function setCustomerName(?string $customerName): void {
        $this->customerName = $customerName;
    }

    /**
     * @return int|null
     */
    public function getSellerCode(): ?int {
        return $this->sellerCode;
    }

    /**
     * @param int|null $sellerCode
     */
    public function setSellerCode(?int $sellerCode): void {
        $this->sellerCode = $sellerCode;
    }

    /**
     * Codifica o token
     * @param Token $token
     * @return string
     * @throws Exception
     */
    public function encode(Token $token): string {

        // Instância o JWT com essa chave e o RS
        $jwt = new JWT(self::certificates($this->type), self::JWT);

        // Expiração do token
        switch ($this->type) {

            // Smtp API
            case 4:

                $this->date->modify('+50 years');

                break;

            // Catálogo Lite PDV API
            case 6:

                if (empty($token->getCustomerCode())) {

                    $this->date->modify('+50 years');

                } else {

                    $this->date->modify('+1 years');

                }

                break;

            // Módulo Força de Vendas Lite PDV
            case 7:

                $this->date->modify('+1 years');

                break;

            default:

                $this->date->modify('+48 hours');

        }

        $date = $this->date->format("Y-m-d H:i:s");
        $jwt->setTestTimestamp(strtotime($date) * 1000);

        // Monta array
        $array = [
            "type" => $this->type,
            "userName" => $token->getUserName(),
            "admin" => $token->getAdmin(),
            "folder" => $token->getFolder(),
            "customerCode" => $token->getCustomerCode(),
            "customerName" => $token->getCustomerName(),
            "sellerCode" => $token->getSellerCode()
        ];

        // Assina o token
        $token =  $jwt->encode($array);

        // Codifica o token
        return openssl_encrypt ($token, self::METHOD, self::METHOD, self::OPTIONS, self::IV);     

    }

    /**
     * Descodifica o token
     * @param array $token
     * @throws Exception
     */
    public function decode(array $token): void {

        // Verifica descodificação
        try {

            if (!empty($token["Authorization"])) {

                $token = substr($token["Authorization"], 7);

            } elseif (!empty($token["authorization"])) {

                $token = substr($token["authorization"], 7);

            } else {

                self::trueExceotion();

            }

            // Instância o JWT com essa chave e o RS
            $jwt = new JWT(self::certificates($this->type), self::JWT);
            $jwt->setTestTimestamp(time() * 1000);
        
            // Descodifica o token
            $token = openssl_decrypt ($token, self::METHOD, self::METHOD, self::OPTIONS, self::IV);

            $token = $jwt->decode($token);

            $this->setUserName($token['userName']);
            $this->setAdmin(!empty($token['admin']) ? $token['admin'] : null);
            $this->setFolder(!empty($token['folder']) ? $token['folder'] : null);
            $this->setCustomerCode(!empty($token['customerCode']) ? $token['customerCode'] : null);
            $this->setCustomerName(!empty($token['customerName']) ? $token['customerName'] : null);
            $this->setSellerCode(!empty($token['sellerCode']) ? $token['sellerCode'] : null);

            // Verifica se o tipo do sistema e válido
            if ($token['type'] != $this->type) {

                self::trueExceotion();

            }

        } catch (JWTException) {

            self::trueExceotion();
                        
        }

    }

    /**
     * @throws Exception
     */
    private static function trueExceotion() {

        // Correção no tempo de resposta
        sleep(2);

        throw new Exception("Autenticação inválida.", 401);

    }

    /**
     * Verifica o tipo do certificado
     */
    private static function certificates(int $type): string {

        // Verifica qual o certificado
        $certificate = match ($type) {
            2 => "PDV",
            6 => "Catalog",
            7 => "FV"
        };

        // Caminho do certificado
        return "/var/www/html/source/Core/Certificates/".$certificate.".key";

    }

}
