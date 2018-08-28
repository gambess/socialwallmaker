<?php

namespace php\Model;

use php\Controller\SmartyController;
use php\Factory\OutputModelInterface;

class HtmlModel implements OutputModelInterface
{

    function __construct()
    {
        
    }

    public static function generaOutput($datos = null, $template = NULL)
    {
        return SmartyController::initSmarty($datos, $template);
    }

}
