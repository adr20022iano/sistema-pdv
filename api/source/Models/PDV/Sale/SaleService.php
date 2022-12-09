<?php

namespace Source\Models\PDV\Sale;

use Exception;
use JetBrains\PhpStorm\ArrayShape;
use JetBrains\PhpStorm\Pure;
use Source\Core\ImageBase64;
use Source\Models\BaseModels\Customer\CustomerFilter;
use Source\Models\PDV\Customer\CustomerDao;
use Source\Models\PDV\Signature\SignatureDao;

class SaleService {

    private SaleFilter $saleFilter;
    private SaleDao $saleDao;
    private CustomerFilter $customerFilter;
    private CustomerDao $customerDao;
    private SignatureDao $signatureDao;
    private object $signatureData;
    protected ImageBase64 $images;

    /**
     * saleService constructor.
     * @throws Exception
     */
    #[Pure] public function __construct(
        private readonly object $token,
        private readonly int    $type,
        private readonly int $saleType,
    ) {

        $this->saleFilter = new SaleFilter();
        $this->saleDao = new SaleDao($this->token->getUserName());
        $this->customerFilter = new CustomerFilter();
        $this->customerDao = new CustomerDao($this->token->getUserName());
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2);

        // Consulta assinatura
        $this->signatureData = $this->signatureDao->read();

        // Configuração das imagens
        $this->images = new ImageBase64(
            $this->token->getFolder(),
            [
                ["name" => "logo", "width" => 320]
            ]
        );

    }

    /**
     * @param Sale $sale
     * @param object $obj
     * @param bool|null $quote
     * @return Sale
     * @throws Exception
     */
    public function setData(Sale $sale, object $obj, ?bool $quote = false): Sale {

        // Monta objeto
        $sale->setProducts($obj->products);

        if (!empty($obj->discount)) {

            // Verifica se é um vendedor e se pode dar desconto
            if (
                ((!$this->token->getAdmin()) and ($this->signatureData->sellerDiscount)) ||
                ($this->token->getAdmin())
            ) {
                $sale->setDiscount(abs($obj->discount));
            }

        }

        if (!empty($obj->shipping)) {
            $sale->setShipping(abs($obj->shipping));
        }

        if (!empty($obj->observation)) {
            $sale->setObservation($obj->observation);
        }

        if (!empty($obj->customerCode)) {

            $sale->setCustomerCode($obj->customerCode);

            $this->checkCustomer($obj, $sale->getCustomerCode(), $quote);

        }

        if (!empty($obj->sellerCode)) {
            $sale->setSellerCode($obj->sellerCode);
        } else {

            if (((int) $this->signatureData->requiredSeller === 2) and ($sale->getOrigin() !== 2)) {

                throw new Exception("Informe o vendedor(a) ".$this->text($this->saleType).".", 400);

            }

        }

        return $sale;

    }

    /**
     * @return array
     */
    public function companyInfo(): array {

        return [
            "phone" => $this->signatureData->phone,
            "fantasyName" => $this->signatureData->fantasyName,
            "address" => $this->signatureData->address,
            "number" => $this->signatureData->number,
            "city" => $this->signatureData->city,
            "cep" => $this->signatureData->cep,
            "district" => $this->signatureData->district,
            "saleObservation" => $this->signatureData->saleObservation,
            "document" => $this->signatureData->document,
            "couponMarginRight" => (int) $this->signatureData->couponMarginRight,
            "couponMarginLeft" => (int) $this->signatureData->couponMarginLeft,
            "receiptType" => (int) $this->signatureData->receiptType
        ];

    }

    /**
     * @param array $saleArray
     * @return array
     * @throws Exception
     */
    public function salePrint(array $saleArray): array {

        // Verifica se vai imprimir a venda
        if (!empty($_GET['print'])) {

            // Calcula totais
            $productsTotal = array_sum(array_filter(array_column($saleArray['products'], 'subtotal')));
            $itemsTotal = array_sum(array_filter(array_column($saleArray['products'], 'quantity')));

            // ADD
            $saleArray['saleTotal'] = round(($productsTotal + $saleArray['shipping']) - $saleArray['discount'], 2);
            $saleArray['productsTotal'] = round($productsTotal, 2);
            $saleArray['itemsTotal'] = round($itemsTotal, 2);

        }

        return $saleArray;

    }

    /**
     * @param array $productsArray
     * @return array
     */
    public function productsPrint(array $productsArray): array {

        return array_map("self::formatting", $productsArray);

    }

    /**
     * @param array $item
     * @return array
     * @throws Exception
     */
    static private function formatting(array $item): array {

        // Verifica se vai imprimir a venda
        if (!empty($_GET['print'])) {

            // Remove
            unset($item['barCode']);
            unset($item['image']);

        } else {

            unset($item['subtotal']);

        }

        return $item;

    }

    /**
     * @param object $obj
     * @return array|null
     */
    public function customerFormat(object $obj): ?array {

        // Verifica se informou um cliente
        if (!empty($obj->customerCode)) {

            return [
                "code" => (int) $obj->customerCode,
                "name" => $obj->customerName,
                "nickname" => !empty($obj->customerNickname) ? $obj->customerNickname : null,
                "city" => !empty($obj->city) ? $obj->city : null,
                "address" => !empty($obj->address) ? $obj->address : null,
                "district" => !empty($obj->district) ? $obj->district : null,
                "number" => !empty($obj->number) ? $obj->number : null,
                "complement" => !empty($obj->complement) ? $obj->complement : null,
                "document" => !empty($obj->document) ? $obj->document : null,
                "phone" => !empty($obj->phone) ? $obj->phone : null
            ];

        } else {
            return null;
        }

    }

    /**
     * @param object $obj
     * @return array|null
     */
    public function sellerFormat(object $obj): ?array {

        // Verifica se informou um vendedor
        if (!empty($obj->sellerCode)) {

            return [
                "code" => (int) $obj->sellerCode,
                "name" => $obj->sellerName
            ];

        } else {
            return null;
        }

    }

    /**
     * @param SaleFilter $saleFilter
     * @return SaleFilter
     */
    public function setFilter(SaleFilter $saleFilter): SaleFilter {

        // Verifica filtro por página
        if (!empty($_GET['page'])) {
            $saleFilter->setPage($_GET['page']);
        }

        // Verifica filtro por cliente
        if (!empty($_GET['customerCode'])) {
            $saleFilter->setCustomerCode($_GET['customerCode']);
        }

        // Verifica filtro por código ou observação
        if (!empty($_GET['codeObservation'])) {
            $saleFilter->setCodeObservation($_GET['codeObservation']);
        }

        // Verifica filtro por data
        if (!empty($_GET['date'])) {
            $saleFilter->setDate($_GET['date']);
        }

        // Verifica filtro por origem
        if (isset($_GET['origin'])) {
            $saleFilter->setOrigin($_GET['origin']);
        }

        // Verifica filtro por vendedor
        if (!empty($_GET['sellerCode'])) {
            $saleFilter->setSellerCode($_GET['sellerCode']);
        }

        // Verifica filtro por status do pagamento
        if (!empty($_GET['paymentStatus'])) {
            $saleFilter->setPaymentStatus($_GET['paymentStatus']);
        }

        // Verifica filtro por bloqueio
        if (!empty($_GET['locked'])) {
            $saleFilter->setLocked($_GET['locked']);
        }

        // Verifica filtro por valor
        if (isset($_GET['value'])) {
            $saleFilter->setValue($_GET['value']);
        }

        return $saleFilter;

    }

    /**
     * @param array $products
     * @return float
     */
    private function productsValueTotal(array $products): float {

        $total = 0;

        foreach ($products as $line) {

            $total += $line->quantity * $line->value;

        }

        return $total;

    }

    /**
     * @param object $obj
     * @param float|null $creditLimit
     * @param float|null $debt
     * @throws Exception
     */
    private function checkCredit(object $obj, ?float $creditLimit, ?float $debt = 0): void {

        // Verifica se informou um cliente
        if ($creditLimit) {

            // Verifica se é pedido de catálogo
            if (!empty($this->type === 6)) {

                // Verifica o total não pago
                $credit = $this->productsValueTotal($obj->products);

            } else {

                // Verifica o total não pago
                $credit = ($this->productsValueTotal($obj->products) + $obj->shipping) - ($obj->discount + (!empty($obj->cash) ? abs($obj->cash) : 0) + (!empty($obj->cash) ? abs($obj->credit) : 0) + (!empty($obj->debit) ? abs($obj->debit) : 0) + (!empty($obj->others) ? abs($obj->others) : 0));

            }

            // Verifica se está editando um pedido
            if (!empty($obj->code)) {

                // Consulta o pedido
                $this->saleFilter->setCode($obj->code);
                $saleLine = $this->saleDao->read($this->saleFilter);

                // Verifica se tem resultado
                if (empty($saleLine)) {

                    throw new Exception("Venda não encontrada.", 404);

                }

                $creditLimit = $creditLimit + (($saleLine->productsValue + $saleLine->shipping) - ($saleLine->discount + $saleLine->paidValue));

            }

            // Calcula crédito disponível
            $available = ($creditLimit - $debt);
            $available = max($available, 0);

            if ($credit > $available) {

                throw new Exception("Crédito insuficiente. O crédito atual do cliente é ".formatCurrency($available), 400);

            }

        }

    }

    /**
     * @param object $obj
     * @param int|null $customerCode
     * @param bool
     * @throws Exception
     */
    private function checkCustomer(object $obj, ?int $customerCode, bool $quote): void {

        if (!empty($customerCode)) {

            // Consulta o cliente
            $this->customerFilter->setCode($customerCode);
            $customerLine = $this->customerDao->read($this->customerFilter);

            // Verificações no cliente
            if (empty($customerLine)) {

                throw new Exception("Cliente não encontrado.", 404);

            } else {

                // Verifica se está bloqueado
                if ($customerLine->blockedSale) {

                    throw new Exception("Cliente bloqueado para fazer compras.", 400);

                } else {

                    if (!$quote) {

                        // Verifica crédito
                        $this->checkCredit($obj, $customerLine->creditLimit, $customerLine->debt);

                    }

                }

            }

        } else {

            // Verifica se o cliente é obrigatório
            // Verifica se veio do (força) de vendas
            if (($obj->requiredCustomerOnSale) || ($this->type === 7)) {

                throw new Exception("Informe o cliente ".$this->text($this->saleType).".", 400);

            }

        }

    }

    /**
     * @param int $saleType
     * @return string
     */
    private function text(int $saleType): string {

        return match ($saleType) {
            0 => "dessa venda",
            1 => "desse orçamento"
        };

    }

    /**
     * @param object $line
     * @return array
     */
    #[ArrayShape([
        "code" => "int",
        "quantity" => "float",
        "subtotal" => "float",
        "value" => "float",
        "name" => "string",
        "unit" => "string",
        "barCode" => "string",
        "categoryName" => "string",
        "image" => "array"
    ])] public function readProducts(object $line): array {

        return [
            "code" => (int) $line->productCode,
            "quantity" => (float) $line->quantity,
            "subtotal" => (float) $line->value * $line->quantity,
            "value" => round($line->value,2),
            "name" => $line->name,
            "unit" => $line->unit,
            "barCode" => $line->barCode,
            "categoryName" => $line->categoryName,
            "image" => $this->images->query($line->productCode)
        ];

    }

    /**
     * @param object $line
     * @param array $products
     * @param bool|null $sale
     * @return array
     * @throws Exception
     */
    #[ArrayShape([
        "code" => "int",
        "discount" => "float",
        "shipping" => "float",
        "saleChange" => "float",
        "paidValue" => "float",
        "unpaidValue" => "float",
        "observation" => "mixed",
        "date" => "string",
        "locked" => "bool",
        "customer" => "mixed",
        "seller" => "mixed",
        "products" => "mixed",
        "print" => "array"
    ])] public function read(object $line, array $products, ?bool $sale = true): array {

        $array = [
            "code" => (int) $line->code,
            "discount" => round($line->discount,2),
            "shipping" => round($line->shipping,2),
            "observation" => $line->observation,
            "date" => dateJson($line->date),
            "customer" => $this->customerFormat($line),
            "seller" => $this->sellerFormat($line),
            "products" => $this->productsPrint($products),
            "print" => !empty($_GET['print']) ? $this->companyInfo() : null
        ];

        if ($sale) {

            // Calcula valor não pago
            $array['unpaidValue'] = max(round((($line->productsValue + $line->shipping) - $line->discount) - $line->paidValue,2), 0);

            $array['saleChange'] = round($line->saleChange,2);
            $array['paidValue'] = round($line->paidValue,2);
            $array['locked'] = (bool) $line->locked;

        }

        return $array;

    }

}
