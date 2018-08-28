<?php
//http://wallmaker/ibiza2017

use php\Controller\FrontController;

header('Content-Type: text/html; charset=UTF-8'); 
ini_set("display_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/vendor/autoload.php';
define('PATH_ABSOLUTO_SRC', __DIR__);

FrontController::main();
