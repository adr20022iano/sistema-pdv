<?php

declare(strict_types=1);

use JetBrains\PhpStorm\Pure;

/**
 * Monta view para resposta
 * @param int $code
 * @param array|null $json
 * @return void
 */
function view(int $code, ?array $json = null): void {

    http_response_code($code);

    if (is_array($json)) {

        echo json_encode($json, 256);

    }

}

/**
 * Conexão com DB
 * @param string|null $dbName
 * @return PDO|bool
 */
function ConnDb(string $dbName = null): PDO|bool {

    $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4; SET time_zone='America/Sao_Paulo';",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
        PDO::ATTR_CASE => PDO::CASE_NATURAL
    ];

    return new PDO(
        'mysql:host='.DB_HOST.';dbname=litepdv_'.$dbName,
        DB_USER,
        DB_PASSWD,
        $options
    );

}

/**
 * Verifica se houve erro no Mysql
 * @param Exception $e
 * @return string
 */
#[Pure] function checkForErrorInMysql(Exception $e): string {

    // Verifica se está em produção
    if (PROD) {

        return "Nenhuma alteração foi feita, verifique os dados informados.";

    } else {

        return $e->getMessage();

    }

}

/**
 * Formata a data para o padrão json
 * @param string $data
 * @return string
 * @throws Exception
 */
function dateJson(string $data): string {

    $formattedDate = new DateTime($data);
    return $formattedDate->format('c');

}

/**
 * Formata a data para o padrão brasileiro
 * @param string $data
 * @param false|null $time
 * @return string
 * @throws Exception
 */
function formatBrazilianDate(string $data, ?bool $time = false): string {

    $formattedDate = new DateTime($data);

    if ($time) {

        return $formattedDate->format('d/m/Y H:i');

    } else {

        return $formattedDate->format('d/m/Y');

    }

}

/**
 * Gera senha segura
 * @param int $quantityChar
 * @param bool $specialChars
 * @return string
 */
function generatePassword(int $quantityChar = 10, bool $specialChars = true): string {

    // Verifica se usa carácter especial
    if ($specialChars) {

        // Letras
        $letters = str_shuffle('#ABCDEFGHKMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz');

        // Caracteres Especiais
        $specialCharacters = str_shuffle('!@#$%*-');

    } else {

        // Letras
        $letters = str_shuffle('ABCDEFGHKMNPQRSTUVWXYZ');

        // Caracteres Especiais
        $specialCharacters = null;

    }

    // Números aleatórios
    $numbers = (((date('Ymd') / 12) * 24) + mt_rand(800, 9999));
    $numbers .= 123456789;

    // Junta tudo
    $characters = $letters.$numbers.$specialCharacters;

    // Embaralha e pega apenas a quantidade de caracteres informada no parâmetro
    return substr(str_shuffle($characters), 0, $quantityChar);

}

/**
 * Verifica se o código de barras é válido
 * @param $barCode
 * @param bool $ignoreScale
 * @return string|null
 * @throws Exception
 */
function testBarCode($barCode, bool $ignoreScale): ?string {

    // Verifica se informou um código
    if (!empty($barCode)) {

        // https://codigosdebarrasbrasil.com.br/tipos-de-codigos-de-barras/
        // Verifica se o código tem mais que 14 dígitos
        if ((strlen($barCode) < 8) || (strlen($barCode) > 14)) {

            // Retorna mensagem e o código http de erro e para a execução do código
            throw new Exception("Código de barras inválido.", 400);

        }

        // Verifica se o código é de controle interno
        if (($barCode[0] === '2') and (!$ignoreScale)) {

            // Retorna mensagem e o código http de erro e para a execução do código
            throw new Exception("Código de barras inválido. Códigos iniciados em 2 são utilizados para controle interno.", 400);

        }

        return $barCode;

    } else {
        return null;
    }

}

/**
 * Verifica se o e-mail é válido
 * @param string $email
 * @return bool
 */
#[Pure] function validateEmail(string $email): bool {

    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);

}

/**
 * Verifica se a senha é segura
 * @param string $password
 * @return bool
 */
function safePassword(string $password): bool {

    // Inicia variável
    $safe = true;
    $letters = preg_replace("/.*?([a-z]*).*?/i", "$1", $password);
    $numbers = preg_replace("/.*?(\d*).*?/", "$1", $password);

    // Verifica se tem menos de 8 caracteres
    if (strlen($password) < 8) {
        $safe = false;
    }

    // Verifica se tem letras
    if (strlen($letters) < 1) {
        $safe = false;
    }

    // Verifica se tem números
    if (strlen($numbers) < 1) {
        $safe = false;
    }

    return $safe;

}

/**
 * Verifica recaptcha
 * @param string $token
 * @param string|null $privateKey
 * @throws Exception
 */
function recaptcha(string $token, ?string $privateKey = null): void {

//    // Verifica se informou uma chave
//    if (empty($privateKey)) {
//        $apiKey = "Adicionar Key";
//    } else {
//        $apiKey = $privateKey;
//    }
//
//    // Inicia variáveis
//    $curl = curl_init();
//
//    // Monta requisição
//    curl_setopt_array($curl,
//
//        [
//            CURLOPT_URL => "https://www.google.com/recaptcha/api/siteverify",
//            CURLOPT_RETURNTRANSFER => true,
//            CURLOPT_ENCODING => "",
//            CURLOPT_MAXREDIRS => 10,
//            CURLOPT_TIMEOUT => 30,
//            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
//            CURLOPT_CUSTOMREQUEST => "POST",
//            CURLOPT_POSTFIELDS => "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"secret\"\r\n\r\n".$apiKey."\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"response\"\r\n\r\n".$token."\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--",
//            CURLOPT_HTTPHEADER => [
//                "cache-control: no-cache",
//                "content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
//            ],
//
//        ]
//
//    );
//
//    // Recebe a resposta da requisição
//    $resposta = curl_exec($curl);
//    $erro = curl_error($curl);
//
//    // Fecha requisição
//    curl_close($curl);
//
//    // Descodifica o Json
//    $obj = json_decode($resposta);
//
//    // Verifica se teve sucesso
//    if ((!$erro) and ($obj !== null)) {
//
//        // Verifica se localizou o resultado
//        if (!$obj->success) {
//
//            throw new Exception("Ops! Não podemos verificar se você é um humano de verdade. Não tente novamente.", 400);
//
//        }
//
//    } else {
//
//        throw new Exception("Ops! O servidor está um pouco lento, tente novamente.", 400);
//
//    }

}

/**
 * Calcula o markup de lucro
 * EX:
 * Receita total: R$ 10.00
 * Custos: R$ 8.00
 * Calculo: 10.00 - 8.00 = 2
 * Converte %: 2 / 8 * 100 = 25%
 *
 * @param float $value
 * @param float $cost
 * @return float Valor em %
 */
function markup(float $value, float $cost): float {

    // Verifica se o valor de venda é igual a 0
    if (($value <> 0) and ($cost > 0)) {

        // Calcula o valor R$ de lucro
        $markup = $value - $cost;

        // Calcula a markup % de lucro
        return ($markup / $cost) * 100;
    } else {
        return 0;
    }

}

/**
 * Calcula a margem de lucro
 * EX:
 * Receita total: R$ 20.000
 * Custos: R$ 13.000
 * Lucro: R$ 20.000 - R$ 13.000 = R$ 7.000
 * Margem de lucro: R$ 7.000/R$ 20.000 = 0.35 x 100 = 35%
 *
 * @param float $value
 * @param float $cost
 * @return float Valor em %
 */
function margin(float $value, float $cost): float {

    // Verifica se o valor de venda é igual a 0
    if (($value <> 0) and ($cost > 0)) {

        // Calcula o valor R$ de lucro
        $margin = $value - $cost;

        // Calcula a margem % de lucro
        return ($margin / $value) * 100;
    } else {
        return 0;
    }

}

/**
 * @param float $value
 * @return float
 */
function filterPositiveValue(float $value): float {

    return ($value > 0) ? $value : 0;

}

/**
 * Formata um valor monetário
 * @param float|int|string $value
 * @return string
 */
function formatCurrency(float|int|string $value): string {

    if ($value) {

        return "R$ ".number_format($value, 2, ",", ".");

    } else {

        return "R$ 0,00";

    }

}

/**
 * Mensagem de erro ao informar um usuário ou senha inválido
 * @throws Exception
 */
function trueExceptionLogin() {

    // Correção no tempo de resposta
    sleep(2);

    throw new Exception("Usuário ou senha inválidos.", 401);

}

/**
 * Mensagem de erro quando não tiver contratado o módulo de força de vendas
 * @throws Exception
 */
function trueExceptionExternalSalesModule() {

    throw new Exception("Módulo de força de vendas não contratado, entre em contato com a Devap pelo WhatsApp: ".PHONE_DEVAP.".", 401);

}

/**
 * Mensagem de erro ao informar um usuário ou senha inválido
 * @throws Exception
 */
function trueExceptionCatalogModule() {

    // Correção no tempo de resposta
    sleep(2);

    throw new Exception("Módulo de catálogo indisponível.", 401);

}

/**
 * Mensagem de erro de permissão do usuário
 * @throws Exception
 */
function trueExceptionAccess() {

    throw new Exception("Você não tem permissão para realizar essa operação.", 400);

}
