<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\Customer\Customer;
use Source\Models\BaseModels\Customer\CustomerFilter;
use Source\Models\PDV\Customer\CustomerDao;

class CustomerApi {

    protected Token $token;
    protected ?object $obj;
    protected Customer $customer;
    protected CustomerFilter $customerFilter;
    protected CustomerDao $customerDao;
    protected int $type = 2;

    /**
     * customerApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token($this->type);
        $this->token->decode(apache_request_headers());
    
        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->customer = new Customer();
        $this->customerFilter = new CustomerFilter();
        $this->customerDao = new CustomerDao($this->token->getUserName());
     
    }

    /**
     * @throws Exception
     */
    public function create(): void {

        $this->duplicity();

        $this->customerDao->create($this->setData());

        // Renderização da view
        view(201,["code" => $this->customer->getCode()]);

    }

    /**
     * @param array $data
     * @throws Exception
     */
    public function read(array $data): void {

        // Monta objeto
        $this->customerFilter->setCode($data['code']);
        $line = $this->customerDao->read($this->customerFilter);

        // Verifica se tem resultado
        if (empty($line)) {
            throw new Exception("Cliente não encontrado.", 404);
        }

        // Monta array
        $list = [
            "code" => (int) $line->code,
            "name" => $line->name,
            "city" => $line->city,
            "document" => $line->document,
            "phone" => $line->phone,
            "cep" => $line->cep,
            "address" => $line->address,
            "district" => $line->district,
            "number" => $line->number,
            "complement" => $line->complement,
            "recordDate" => $line->registerDate,
            "catalogAccess" => (bool) $line->catalogAccess,
            "blockedSale" => (bool) $line->blockedSale,
            "nickname" => $line->nickname,
            "creditLimit" => (float) $line->creditLimit,
            "email" => $line->email,
            "note" => $line->note
        ];

        // Renderização da view
        view(200, $list);

    }

    /**
     * @throws Exception
     */
    public function readAll(): void {

        // Verifica filtro por página
        if (!empty($_GET['page'])) {
            $this->customerFilter->setPage($_GET['page']);
        }

        // Verifica se filtra por nome
        if (!empty($_GET['name'])) {
            $this->customerFilter->setName($_GET['name']);
        }

        // Verifica se filtra por cidade
        if (!empty($_GET['city'])) {
            $this->customerFilter->setFilterCity($_GET['city']);
        }

        // Verifica filtro por disponibilidade de compra
        if (!empty($_GET['sale'])) {
            $this->customerFilter->setSale($_GET['sale']);
        }

        // Verifica filtro por catálogo
        if (!empty($_GET['catalog'])) {
            $this->customerFilter->setFilterCatalog($_GET['catalog']);
        }

        // Verifica filtro por e-mail
        if (!empty($_GET['email'])) {
            $this->customerFilter->setFilterEmail($_GET['email']);
        }

        // Verifica filtro por documento
        if (!empty($_GET['document'])) {
            $this->customerFilter->setFilterDocument($_GET['document']);
        }

        // Inicia variáveis
        $list = [];

        // Monta a lista
        foreach ($this->customerDao->readAll($this->customerFilter) as $line) {

            $list[] = [
                "code" => (int) $line->code,
                "name" => $line->name,
                "city" => $line->city,
                "phone" => $line->phone,
                "blockedSale" => (bool) $line->blockedSale,
                "nickname" => $line->nickname,
                "address" => $line->address,
                "number" => $line->number,
                "complement" => $line->complement,
                "district" => $line->district,
                "debt" => (float) $line->debt
            ];

        }

        // Renderização da view
        view(200, $list);

    }

    /**
     * @throws Exception
     */
    public function update(): void {

        $this->duplicity();

        $this->customer->setCode($this->obj->code);
        $this->customerDao->update($this->setData());

        // Renderização da view
        view(204);
    
    }

    /**
     * Deleta um registro
     * @param array $data
     * @throws Exception
     */
    public function delete(array $data): void {

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {
            trueExceptionAccess();
        }

        // Monta objeto
        $this->customer->setCode($data['code']);
        $this->customerDao->delete($this->customer);

        // Renderização da view
        view(204);
    
    }

    /**
     * Consulta se e-mail e documento já foi cadastrado
     * @throws Exception
     */
    protected function duplicity(): void {

        if (!empty($this->obj->code)) {
            $this->customerFilter->setNotCode($this->obj->code);
        }

        // Verifica documento
        if (!empty($this->obj->document)) {

            $this->customerFilter->setFilterDocument($this->obj->document);
            $this->customerFilter->setFilterEmail(null);

            if (count($this->customerDao->readAll($this->customerFilter)) > 0) {

                throw new Exception("Já existe um cadastrado utilizando esse documento.", 409);

            }

        }

        // Verifica e-mail
        if (!empty($this->obj->email)) {

            $this->customerFilter->setFilterEmail($this->obj->email);
            $this->customerFilter->setFilterDocument(null);

            if (count($this->customerDao->readAll($this->customerFilter)) > 0) {

                throw new Exception("Já existe um cadastrado utilizando esse e-mail.", 409);

            }

        }

    }

    /**
     * @return Customer
     * @throws Exception
     */
    protected function setData(): Customer {

        // Monta objeto
        $this->customer->setName($this->obj->name);

        if (!empty($this->obj->document)) {
            $this->customer->setDocument($this->obj->document);
        }

        if (!empty($this->obj->phone)) {
            $this->customer->setPhone($this->obj->phone);
        }

        if (!empty($this->obj->cep)) {
            $this->customer->setCep($this->obj->cep);
        }

        if (!empty($this->obj->city)) {
            $this->customer->setCity($this->obj->city);
        }

        if (!empty($this->obj->address)) {
            $this->customer->setAddress($this->obj->address);
        }

        if (!empty($this->obj->district)) {
            $this->customer->setDistrict($this->obj->district);
        }

        if (!empty($this->obj->number)) {
            $this->customer->setNumber($this->obj->number);
        }

        if (!empty($this->obj->complement)) {
            $this->customer->setComplement($this->obj->complement);
        }

        if (!empty($this->obj->catalogAccess)) {
            $this->customer->setCatalogAccess($this->obj->catalogAccess);
        }

        if (!empty($this->obj->password)) {
            $this->customer->setPassword($this->obj->password);
        }

        if (!empty($this->obj->blockedSale)) {
            $this->customer->setBlockedSale($this->obj->blockedSale);
        }

        if (!empty($this->obj->nickname)) {
            $this->customer->setNickname($this->obj->nickname);
        }

        if (!empty($this->obj->creditLimit)) {
            $this->customer->setCreditLimit($this->obj->creditLimit);
        }

        if (!empty($this->obj->email)) {
            $this->customer->setEmail($this->obj->email);
        }

        if (!empty($this->obj->note)) {
            $this->customer->setNote($this->obj->note);
        }

        return $this->customer;

    }
    
}
