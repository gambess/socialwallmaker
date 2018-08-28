<?php

namespace php\Service\Apis\Instagram;

use php\Factory\ApiInterface;
use php\Librerias\Configuracion;
use Bolandish\Instagram as InstagramWrapper;

class Instagram implements ApiInterface
{
    private $_setting = array();
    private $_url = '';
    private $_query = '';
    private $_numDatos = TWITTER_NUM_INSTAGRAM;
    private $_arrayHashtag = array();
    private $_claveInicial;
    private $_config = array();

    public function __construct($path_config_ini)
    {
        $this->_config = Configuracion::cargarConfiguracionArchivo($path_config_ini);
        
        if (count($this->_config['instagram']) > 0) {
            $this->_setting         = $this->_config['instagram']['setting'];
            $this->_url             = $this->_config['instagram']['url'];
            $this->_query           = $this->_config['instagram']['query'];
            $this->_numDatos        = $this->_config['instagram']['numDatos'];
            $this->_claveInicial    = $this->_config['instagram']['claveInicial'];
        }
    }

    public static function getInfoObj($json)
    {
        $Obj = new \stdClass();
        $Obj->UserName = $json->owner->username;
        $Obj->UserNameLink = 'https://instagram.com/' . $json->owner->username;
        $Obj->UserImg = $json->owner->profile_pic_url;
        $Obj->UserImgWidth = '48';
        $Obj->UserImgHeight = '';
        $Obj->UserFullName = $json->owner->full_name;
        $Obj->Thumbnail = $json->thumbnail_src;
        $Obj->ImageUrl = $json->display_src;
        $Obj->ImageSizeWidth = '135';
        $Obj->ImageSizeHeight = '';
        $Obj->ImagesLowResolution = '';
        $Obj->Html = isset($json->html) ? $json->html : '';
        $Obj->Link = $json->display_src;
        $Obj->ImageExpandedUrl = FALSE;
        $Obj->ImageExpandedUrlWidth = '';
        $Obj->CreatedTime = $json->date;

        return $Obj;
    }

    public function getElementos() {
        
        $respuesta = null;
        $instagramJson = $this->instagramRequest();

        if (is_null($instagramJson) || count($instagramJson) == 0) {
            return null;
        }
        // Establecemos la salida $data hacia la clave del servicio (instagram)
        // y por cada hashTag definido en la salida.
        foreach ($instagramJson as $hashtag => $obj) {
            $data[$this->_claveInicial][$hashtag] = $obj;
        }
        foreach ($data[$this->_claveInicial] as $hashtag => $arrayData) {
            if (isset($arrayData['data']) && count($arrayData['data']) > 0) {
                foreach ($arrayData['data'] as $imgPorHashtag) {
                    $id = $this->_claveInicial . '-' . $hashtag . '-' . $imgPorHashtag->id;
                    $respuesta[$id] = $imgPorHashtag;
                    if (isset($imgPorHashtag->caption)) {
                        $html = $this->escribeTextEnHtml($imgPorHashtag->caption);
                        $respuesta[$id]->html = $html;
                        unset($html);
                    }
                    unset($id);
                }
            } else {
                continue;
            }
        }
        return $respuesta;
    }
        
    private function instagramRequest() {
        $jsn = array();
        $array_salida = array();
        
        if (is_array($this->_arrayHashtag) && count($this->_arrayHashtag) > 0) {
            $q = array();
            // Iteraciones para recuperar los elementos
            foreach ($this->_arrayHashtag as $hashtag) {
                
                $response = InstagramWrapper::getMediaByHashtag($hashtag, $this->_numDatos);
                if(is_array($response) && count($response) > 0 ){ 
                    $jsn['data'] = $response;
                    $array_salida[$hashtag] = $jsn;
                    continue;
                }else{
                    $array_salida[$hashtag] = null;
                    continue;
                }
                
            }
            return $array_salida;
        }else {
            return null;
        }
        
        
    }
    
    private function escribeTextEnHtml($text)
    {
        $text = preg_replace("/#([\p{L}|\p{N}|_]*)/u", "<a href=\"https://instagram.com/explore/tags/$1\">#$1</a>", $text);
        $text = preg_replace("/(?<=^|(?<=[^a-zA-Z0-9-_\\.]))@([\p{L}\p{N}_.]*)/u", "<a href=\"https://instagram.com/$1\">@$1</a>", $text);

        return $text;
    }

    /**
     * Define los hashtags
     * @param string $hashtags
     */
    public function setHashTags($hashtags)
    {
        $this->_hashtags = $hashtags;
        $this->_arrayHashtag = $this->getHashtagsArray($hashtags);
    }

    /**
     * Establece el número de datos a recuperar
     * @param type $numero
     */
    public function setNumeroDatos($numero)
    {
        $this->_numDatos = $numero;
    }

    /**
     * Devuelve el número de datos que se van a recuperar
     * @return integer
     */
    public function getNumeroDatos()
    {
        return $this->_numDatos;
    }

    /**
     * Devuelve los hashtags como array, a partir de un string de entrada separado por comas ','
     * @param string $hashTags
     * @return array
     */
    private function getHashtagsArray($hashTags)
    {
        $array = explode(',', $hashTags);
        return array_map('trim', $array);
    }

    public function setQueryParams($queryParams, $objectBaneados)
    {
        
    }

}
