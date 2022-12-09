<?php

namespace Source\Models\PDV\Product\Enum;

enum ReportOrderType: int {

    case Code = 1;
    case Stock = 2;
    case Cost = 3;
    case Value = 4;

}