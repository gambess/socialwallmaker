<?php

namespace php\Factory;

use php\Service\Apis\Twitter\Twitter;
use php\Service\Apis\Instagram\Instagram;

abstract class ApiServiceFactory
{
    const TWITTER = 'twitter';
    const INSTAGRAM = 'instagram';
    
    public static function createService($tipoServicio)
    {
        switch ($tipoServicio) {
            case self::TWITTER:
                return new Twitter(PATH_CONFIGURATION_API_TWITTER);
                break;
            case self::INSTAGRAM:
                return new Instagram(PATH_CONFIGURATION_API_INSTAGRAM);
                break;
            default:
                return null;
        }
    }

}
