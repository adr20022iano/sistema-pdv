<?php

namespace Source\Models\PDV\Sale\Enum;

enum PaymentStatus: int {

    case Paid = 1;
    case Overpaid = 2;
    case PartiallyPaid = 3;

}
