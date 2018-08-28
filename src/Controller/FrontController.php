<?php

namespace php\Controller;

use php\Router\RouterProvider;

class FrontController
{

    public static function main()
    {
        require_once PATH_ABSOLUTO_SRC . '/conf/ConstantConfig.php';
        require_once PATH_ABSOLUTO_SRC . '/conf/ConstantMensajes.php';
        
        if (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] != '/') {
            $routeProvider = new RouterProvider(PATH_CONFIGURATION_ROUTING);
            $match = $routeProvider->getMatch();
            self::init($match['hashtag']);
            $routeProvider->launchController();
        } else {
            self::init();
            print_r(HASHTAG_NOT_URL);
        }
    }

    public static function init($hashtag = null)
    {
        $portal = null !== $hashtag ? $hashtag : '';
        define('MI_PORTAL', $portal);

    }

}
