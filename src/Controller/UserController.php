<?php

namespace php\Controller;

abstract class UserController
{
    public static function getNickName()
    {
        return isset($_SERVER['HTTP_X_UNAME']) ? $_SERVER['HTTP_X_UNAME'] : false;
    }

}
