<?php

namespace php\Factory;

interface ApiInterface
{
    /**
     * Define el número de datos a recuperar
     * @param integer $numero
     * @return void
     */
    public function setNumeroDatos($numero);

    /**
     * Define el número de datos a recuperar
     * @param string $hashtags hashtags separadas por comas ','
     * @return void
     */
    public function setHashTags($hashtags);

    /**
     * Devuelve el array json de los registros de la api (tweets, instagrams, etc...)
     * siguiendo las siguientes normas:
     *     - La clave de cada objeto debe tener el formato:
     *       <api-name>-<hashtag>-id-objeto
     *     - La api-name: twitter, instagram, etc..
     * 
     * @return array
     */
    public function getElementos();

    public function setQueryParams($queryParams, $objectBaneados);

    public static function getInfoObj($json);
}
