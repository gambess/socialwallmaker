<?php

namespace php\Controller;

use php\Router\RouterProvider;
use Smarty;

abstract class SmartyController
{

    private static $routerProvider;

    public static function initSmarty($datos = null, $template)
    {
        self::initRouterProvider();
        
        // Class Constructor. These automatically get set with each new instance.
        $smarty = new \Smarty();
        

        $smarty->compile_check = true;
        $smarty->template_dir = PATH_ABSOLUTO_DIRECTORIO_PLANTILLAS;
        $smarty->compile_dir = PATH_ABSOLUTO_TEMPLATE_PLANTILLAS_COMPILADAS;

        foreach ($datos as $key => $value) {
            $smarty->assign($key, $value);
        }

        
        
        $smarty->assign('router', self::$routerProvider);

        return $smarty->fetch($template);
    }
    
    public static function initRouterProvider()
    {
        self::$routerProvider = new RouterProvider(PATH_CONFIGURATION_ROUTING);
    }

}
