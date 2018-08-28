<?php

define('BASE_URL', 'http://wallmaker/');



/*
 * Rutas para los archivos de configuración de la aplicación
 */
define('PATH_CONFIGURACION',                PATH_ABSOLUTO_SRC . '/conf/Config.ini');
define('PATH_CONFIGURATION_API_TWITTER',    PATH_ABSOLUTO_SRC . '/conf/api_config_twitter.ini');
define('PATH_CONFIGURATION_API_INSTAGRAM',  PATH_ABSOLUTO_SRC . '/conf/api_config_instagram.ini');
define('PATH_CONFIGURATION_ROUTING',        PATH_ABSOLUTO_SRC . '/conf/Routing.ini');

/*
 * Plantillas SMARTY del proyecto
 */
define('PATH_ABSOLUTO_DATA',                       PATH_ABSOLUTO_SRC . '/data');
define('PATH_ABSOLUTO_DIRECTORIO_PLANTILLAS',                       PATH_ABSOLUTO_SRC . '/templates');
define('PATH_ABSOLUTO_TEMPLATE_PLANTILLAS_COMPILADAS', PATH_ABSOLUTO_DIRECTORIO_PLANTILLAS . '/compiled');

define('TWITTER_NUM_DATOS', 30);
define('TWITTER_NUM_INSTAGRAM', 20);