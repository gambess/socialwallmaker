<?php

namespace php\Factory;

use php\Model\HtmlModel;
use php\Model\XmlModel;
use php\Model\JsonModel;

abstract class OutputModelFactory
{
    const HTML = 'html';
    const XML = 'xml';
    const JSON = 'json';
    
    public static function generaOutput($tipoModelo, $datos, $tpl)
    {
        switch (strtolower($tipoModelo)) {
            case self::HTML:
                return HtmlModel::generaOutput($datos, $tpl);
                break;
            case self::XML:
                return XmlModel::generaOutput($datos, $tpl);
                break;
            case self::JSON:
                return JsonModel::generaOutput($datos, $tpl);
                break;
            default:
                return null;
        }
    }

}
