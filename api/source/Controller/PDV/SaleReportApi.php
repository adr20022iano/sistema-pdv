<?php  /** @noinspection PhpUnused */

namespace Source\Controller\PDV;

use Exception;
use Source\Core\Token;
use Source\Models\PDV\CashBook\CashBookReport;
use Source\Models\PDV\CashBook\CashBookReportDao;
use Source\Models\PDV\Sale\SaleReport;
use Source\Models\PDV\Sale\SaleReportDao;
use Source\Models\PDV\Signature\SignatureDao;
use Source\Models\PDV\Sale\SaleReportService;

class SaleReportApi {

    protected Token $token;
    protected ?object $obj;
    protected SaleReport $saleReport;
    protected SaleReportDao $saleReportDao;
    protected SignatureDao $signatureDao;
    protected CashBookReport $cashBookReport;
    protected CashBookReportDao $cashBookReportDao;
    protected SaleReportService $saleReportService;

    /**
     * SaleReportApi constructor.
     * @throws Exception
     */
    public function __construct() {

        // Verifica o login
        $this->token = new Token(2);
        $this->token->decode(apache_request_headers());

        // Recebe JSON e Descodifica o Json
        $this->obj = json_decode(file_get_contents('php://input'));

        $this->saleReport = new SaleReport();
        $this->saleReportDao = new SaleReportDao($this->token->getUserName());
        $this->signatureDao = new SignatureDao($this->token->getUserName(),2) ;
        $this->cashBookReport = new CashBookReport();
        $this->cashBookReportDao = new CashBookReportDao($this->token->getUserName());
        $this->saleReportService = new SaleReportService();

        // Verifica se é admin.
        if (!$this->token->getAdmin()) {

            // Consulta assinatura
            $signature = $this->signatureDao->read();

            if (!$signature->sellerDeletePayment) {
                trueExceptionAccess();
            }

        }

    }

    /**
     * Consulta os registros
     * @throws Exception
     */
    public function read(): void {

        // Verifica filtro e monta objeto
        $this->saleReport = $this->saleReportService->setFilter($this->saleReport, $this->obj);

        // Inicia variáveis
        $paymentsReceived = 0;
        $list = [];
        $codesList = [];

        // Monta a lista
        foreach ($this->saleReportDao->read($this->saleReport) as $line) {

            $codesList[] = $line->code;

            $value = ($line->productsValue + $line->shipping) - $line->discount;

            // Verifica se é um admin
            if ($this->token->getAdmin()) {

                $productsCost = $line->productsCost;
                $profitValue = $value - $line->productsCost;
                $profitMargin = margin($value, $line->productsCost);
                $profitMarkup = markup($value, $line->productsCost);

            } else {

                $productsCost = 0;
                $profitValue = 0;
                $profitMargin = 0;
                $profitMarkup = 0;

            }

            $list[] = [
                "code" => (int) $line->code,
                "date" => dateJson($line->date),
                "customerName" => $line->customerName,
                "value" => round($value,2),
                "cash" => round($line->cash,2),
                "credit" => round($line->credit,2),
                "debit" => round($line->debit,2),
                "others" => round($line->others,2),
                "saleChange" => round($line->saleChange,2),
                "paidValue" => round($line->paidValue,2),
                "productsCost" => round($productsCost,2),
                "discount" => round($line->discount,2),
                "shipping" => round($line->shipping,2),
                "profitValue" => $profitValue,
                "profitMargin" => $profitMargin,
                "profitMarkup" => $profitMarkup,
            ];

        }

        // Verifica filtro e monta objeto
        $this->cashBookReport->setSaleCodeNotIn($codesList);

        // Monta a lista
        foreach ($this->cashBookReportDao->readToSale($this->cashBookReport, $this->saleReport) as $line) {

            $paymentsReceived += $line->value;

        }

        // Calcula totais
        $totalSaleValue = array_sum(array_column($list, 'value'));
        $totalPaidValue = array_sum(array_column($list, 'paidValue'));
        $totalProductsCost = array_sum(array_column($list, 'productsCost'));
        $totalDiscount = array_sum(array_column($list, 'discount'));
        $totalShipping = array_sum(array_column($list, 'shipping'));
        $totalPaidCash = array_sum(array_column($list, 'cash'));
        $totalPaidCredit = array_sum(array_column($list, 'credit'));
        $totalPaidDebit = array_sum(array_column($list, 'debit'));
        $totalPaidOthers = array_sum(array_column($list, 'others'));

        // Renderização da view
        view(200, [
            "data" => [
                "totalSaleValue" => formatCurrency($totalSaleValue),
                "totalPaidValue" => formatCurrency($totalPaidValue),
                "totalUnpaidValue" => formatCurrency($totalSaleValue - $totalPaidValue),
                "totalProductsCost" => formatCurrency($totalProductsCost),
                "totalDiscount" => formatCurrency($totalDiscount),
                "totalShipping" => formatCurrency($totalShipping),
                "profitValue" => formatCurrency($totalSaleValue - $totalProductsCost),
                "profitMargin" => round(margin($totalSaleValue, $totalProductsCost), 2)." %",
                "profitMarkup" => round(markup($totalSaleValue, $totalProductsCost), 2)." %",
                "totalPaidCash" => formatCurrency($totalPaidCash),
                "totalPaidCredit" => formatCurrency($totalPaidCredit),
                "totalPaidDebit" => formatCurrency($totalPaidDebit),
                "totalPaidOthers" => formatCurrency($totalPaidOthers),
                "paymentsReceived" => formatCurrency($paymentsReceived)
            ],
            "list" => $this->saleReportService->salePrint($list)
        ]);

    }

}
