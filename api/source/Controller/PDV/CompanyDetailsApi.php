<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\ImageBase64;
use Source\Core\Token;
use Source\Models\PDV\Signature\Signature;
use Source\Models\PDV\Signature\SignatureDao;

class CompanyDetailsApi {

    protected Token $token;
    protected ?object $obj;
    protected Signature $signature;
    protected SignatureDao $signatureDao;
    private ImageBase64 $images;

    /**
     * settingsApi constructor.
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

        // Verifica se é admin.
        if ((!$this->token->getAdmin()) and ($_SERVER['REQUEST_METHOD'] !== "POST")) {
            trueExceptionAccess();
        }

        // Configuração das imagens
        $this->images = new ImageBase64(
            $this->token->getFolder(),
            [
                ["name" => "logo", "width" => 320]
            ]
        );

    }

    /**
     * Consulta os registros
     */
    public function read(): void {

        // Consulta assinatura
        $line = $this->signatureDao->read();

        // Renderização da view
        view(200, [
            "image" =>  $this->images->query(null, "logo"),
            "name" => $line->name,
            "fantasyName" => $line->fantasyName,
            "document" => $line->document,
            "phone" => $line->phone,
            "email" => $line->email,
            "cep" => $line->cep,
            "address" => $line->address,
            "number" => $line->number,
            "city" => $line->city,
            "district" => $line->district,
            "complement" => $line->complement
        ]);

    }

    /**
     * Atualiza um registro
     * @throws Exception
     */
    public function update(): void {

        // Monta objeto
        if (!empty($this->obj->name)) {
            $this->signature->setName($this->obj->name);
        }

        if (!empty($this->obj->fantasyName)) {
            $this->signature->setFantasyName($this->obj->fantasyName);
        }

        if (!empty($this->obj->document)) {
            $this->signature->setDocument($this->obj->document);
        }

        if (!empty($this->obj->phone)) {
            $this->signature->setPhone($this->obj->phone);
        }

        if (!empty($this->obj->email)) {
            $this->signature->setEmail($this->obj->email);
        }

        if (!empty($this->obj->cep)) {
            $this->signature->setCep($this->obj->cep);
        }

        if (!empty($this->obj->address)) {
            $this->signature->setAddress($this->obj->address);
        }

        if (!empty($this->obj->number)) {
            $this->signature->setNumber($this->obj->number);
        }

        if (!empty($this->obj->city)) {
            $this->signature->setCity($this->obj->city);
        }

        if (!empty($this->obj->district)) {
            $this->signature->setDistrict($this->obj->district);
        }

        if (!empty($this->obj->complement)) {
            $this->signature->setComplement($this->obj->complement);
        }

        $this->signatureDao->upCompanyDetails($this->signature);

        $this->uploadImage();

        // Renderização da view
        view(204);

    }

    /**
     * Faz o envio da imagem
     * @throws Exception
     */
    private function uploadImage(): void {

        // Verifica se enviou a imagem
        if (!empty($this->obj->image)) {

            // Verifica se deleta a imagem
            if ($this->obj->image === "delete") {

                $this->images->delete();

            } else {

                $this->images->upload($this->obj->image);

            }

        }

    }

}
