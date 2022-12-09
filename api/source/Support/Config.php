<?php /** @noinspection SpellCheckingInspection */

/**
 * Build
 */
define("PROD", getenv('PROD') === "true");

/**
 * Headers
 */
header("Content-type: application/json; charset=utf-8");

/**
 * Time zone
 */
date_default_timezone_set('America/Sao_Paulo');

/**
 * Dados da Devap
 */
const PHONE_DEVAP = "(35)92000-1849";

/**
 * API hub do desenvolvedor
 */
const HD_API_TOKEN = "";

/**
 * Verifica build do projeto
 */
if (!PROD) {

    /**
     * Dados gerais
     */
    define("BASE_URL", "http://localhost:90");

    /**
     * Dados de conexão com o Bando de dados Dev
     */
    define("DB_HOST", "");
    define("DB_USER", "");
    define("DB_PASSWD", "");

} else {

    /**
     * Dados gerais
     */
    define("BASE_URL", "https://api.aframpe.com.br");

    /**
     * Dados de conexão com o Banco de dados em produção
     */
    define("DB_HOST", "191.252.120.114");
    define("DB_USER", "webservice");
    define("DB_PASSWD", "aSlpQ9875orvw{D[^LX[%zPvtQPadri_dKb");

}
