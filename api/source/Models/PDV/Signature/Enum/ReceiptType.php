<?php

namespace Source\Models\PDV\Signature\Enum;

enum ReceiptType: int {

    case A4 = 1;
    case A4_2 = 2;
    case MM55 = 3;
    case MM80 = 4;

}