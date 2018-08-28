<?php

namespace php\Model;

use php\Factory\OutputModelInterface;

class JsonModel implements OutputModelInterface
{

    function __construct()
    {
        
    }

    public static function generaOutput($datos = null)
    {
        $objeto = $datos['datos'];
        
        if (isset($objeto->estadistica)) {
            unset($objeto->estadistica);
        }
        
        $json = isset($objeto->datos) ? json_encode($objeto->datos) : NULL;
        return $json;
    }

}
