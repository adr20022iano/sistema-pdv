<?php

namespace Source\Models\PDV\Customer;

use Exception;
use Source\Models\BaseModels\Customer\Customer AS CustomerBase;

class Customer extends CustomerBase {

    private bool $catalogAccess = false;
    private ?bool $blockedSale = false;
    private ?string $password = null;
    private ?string $nickname = null;
    private ?float $creditLimit = null;
    private ?string $email = null;
    private ?string $note = null;

    /**
     * @return bool
     */
    public function isCatalogAccess(): bool {
        return $this->catalogAccess;
    }

    /**
     * @param bool $catalogAccess
     */
    public function setCatalogAccess(bool $catalogAccess): void {
        $this->catalogAccess = $catalogAccess;
    }

    /**
     * @return string|null
     */
    public function getPassword(): ?string {
        return $this->password;
    }

    /**
     * @param string|null $password
     * @throws Exception
     */
    public function setPassword(?string $password): void {

        // Verifica se a senha é segura
        if (!safePassword($password)) {
            throw new Exception("A senha informada não é segura ou muito pequena. Ela deve conter letras e números", 409);
        }

        // Gera hash da senha
        $password = password_hash($password, PASSWORD_DEFAULT);

        $this->password = $password;

    }

    /**
     * @return bool|null
     */
    public function getBlockedSale(): ?bool {
        return $this->blockedSale;
    }

    /**
     * @param bool|null $blockedSale
     */
    public function setBlockedSale(?bool $blockedSale): void {
        $this->blockedSale = $blockedSale;
    }

    /**
     * @return string|null
     */
    public function getNickname(): ?string {
        return $this->nickname;
    }

    /**
     * @param string|null $nickname
     */
    public function setNickname(?string $nickname): void {
        $this->nickname = $nickname;
    }

    /**
     * @return float|null
     */
    public function getCreditLimit(): ?float {
        return $this->creditLimit;
    }

    /**
     * @param float|null $creditLimit
     */
    public function setCreditLimit(?float $creditLimit): void {
        $this->creditLimit = $creditLimit;
    }

    /**
     * @return string|null
     */
    public function getEmail(): ?string {
        return $this->email;
    }

    /**
     * @param string|null $email
     * @throws Exception
     */
    public function setEmail(?string $email): void {

        // Verifica e-mail
        if (validateEmail($email)) {
            $this->email = $email;
        } else {

            throw new Exception("E-Mail inválido", 409);

        }

    }

    /**
     * @return string|null
     */
    public function getNote(): ?string {
        return $this->note;
    }

    /**
     * @param string|null $note
     */
    public function setNote(?string $note): void {
        $this->note = $note;
    }

}
