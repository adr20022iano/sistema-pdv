<?php

namespace Source\Core;

use Exception;
use Source\Models\BaseModels\Signature\SignatureDao;

class Login {

    protected int $type;
    protected bool $multiplePassword = false;

    /**
     * Monta o token para o usuário
     * @param bool $admin
     * @param object $signature
     * @param string $userName
     * @throws Exception
     */
    protected function tokenGenerate(bool $admin, object $signature, string $userName): void {

        $token = new Token($this->type);
        $token->setUserName($userName);
        $token->setAdmin($admin);
        $token->setFolder($signature->folder);

        // Renderização da view
        view(200, [
            "token" => $token->encode($token)
        ]);

    }

    /**
     * Faz o ‘login’ do usuário
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
        if ((safePassword($jsonObj->password)) and (Connection::getConn($userName))) {

            // Consulta assinatura
            $signatureDao = new SignatureDao($userName, $this->type);
            $signatureData = $signatureDao->read();

            // Verifica as senha
            $passwordVerify = ($this->multiplePassword and !empty($signatureData->password)) ? password_verify($jsonObj->password, $signatureData->password) : null;
            $adminPasswordVerify = password_verify($jsonObj->password, $signatureData->adminPassword);

            // Verifica qual senha foi informada
            if ((($adminPasswordVerify) || ($passwordVerify)) and ($signatureData->errorPassword < 100)) {

                // Verifica se está bloqueado
                if ($signatureData->blocked) {

                    // Correção no tempo de resposta
                    sleep(2);
                    throw new Exception("Seu sistema está bloqueado, entre em contato com a Devap pelo 
                    WhatsApp: ".PHONE_DEVAP.".", 403);

                } else {

                    $this->tokenGenerate($adminPasswordVerify, $signatureData, $userName);

                }

            } else {

                // Atualiza erros na senha
                $signatureDao->UpErrorPassword();

                // Verifica erros da senha
                if ($signatureData->errorPassword > 100) {

                    // Correção no tempo de resposta
                    sleep(2);
                    throw new Exception("Conta da Devap bloqueada por segurança, altere sua senha.", 403);

                } else {

                    // Verifica o tipo da senha
                    if (substr_count($jsonObj->password, "-") === 3) {

                        // Correção no tempo de resposta
                        sleep(2);
                        throw new Exception("A senha informada parece ser um código de acesso do Força de Vendas. Acesse: fv-pdv.devap.com.br", 403);

                    } else {

                        trueExceptionLogin();

                    }

                }

            }

        } else {

            trueExceptionLogin();

        }

    }

    /**
     * Renova o ‘login’ do usuário
     * @throws Exception
     */
    public function loginUpToken(): void {

        // Verifica o login
        $token = new Token($this->type);
        $token->decode(apache_request_headers());

        // Consulta assinatura
        $signatureDao = new SignatureDao($token->getUserName(), $this->type);
        $signatureData = $signatureDao->read();

        // Verifica se está bloqueado
        if ($signatureData->blocked) {

            throw new Exception("Seu sistema está bloqueado, entre em contato com a Devap pelo 
            WhatsApp: ".PHONE_DEVAP.".", 403);

        } else {

            $this->tokenGenerate($token->getAdmin(), $signatureData, $token->getUserName());

        }

    }

}
