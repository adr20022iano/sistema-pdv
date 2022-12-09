<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;

class CnpjQueryApi {

    protected Token $token;
    protected ?object $obj;
    protected int $type = 2;

    /**
     * cnpjQueryApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        // Inicia variáveis
        $curl = curl_init();

        // Monta requisição
        curl_setopt_array($curl,
            array(
                CURLOPT_URL => "https://ws.hubdodesenvolvedor.com.br/v2/cnpj/?cnpj=".$data['cnpj']."&token=".HD_API_TOKEN,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => array(
                    "Content-Type: application/json"
                ),
            )
        );

        // Recebe a resposta da requisição
        $response = curl_exec($curl);
        $error = curl_error($curl);

        // Fecha requisição
        curl_close($curl);

        // Decodifica o Json
        $obj = json_decode($response);

        // Verifica se teve sucesso
        if ((!$error) and ($obj !== null)) {

            // Verifica se localizou o resultado
            if ($obj->status) {

                // Renderização da view
                view(200, [
                    "active" => $obj->result->situacao === "ATIVA",
                    "name" => $obj->result->nome,
                    "nickname" => $obj->result->fantasia,
                    "phone" => $obj->result->telefone,
                    "email" => $obj->result->email,
                    "city" => ucwords(mb_strtolower($obj->result->municipio))." - ".$obj->result->uf,
                    "address" => $obj->result->logradouro,
                    "number" => $obj->result->numero,
                    "complement" => $obj->result->complemento,
                    "district" => $obj->result->bairro,
                    "cep" => str_replace(".", "", $obj->result->cep),
                    "activity" => [
                        "text" => $obj->result->atividade_principal->text,
                        "code" => $obj->result->atividade_principal->code
                    ]
                ]);

            } else {

                throw new Exception("O CNPJ informado não encontrado.", 404);

            }

        } else {

            throw new Exception("Ops! O servidor da receita está um pouco lento, tente novamente.", 500);

        }

    }

}
