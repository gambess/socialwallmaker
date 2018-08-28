<?php

namespace php\Service\Apis\Twitter;

use Twitter_Autolink;
use php\Factory\ApiInterface;
use php\Librerias\Configuracion;

class Twitter implements ApiInterface
{

    private $_setting = array();
    private $_url = '';
    private $_query = '';
    private $_requestMethod = '';
    private $_numDatos = 100;
    private $_arrayHashtag = array();
    private $_claveInicial;
    private $_query_param = '';
    private $_config = array();

    public function __construct($path_config_ini)
    {
        $this->_config = Configuracion::cargarConfiguracionArchivo($path_config_ini);
               
        if (count($this->_config['twitter']) > 0) {
            $this->_setting         = $this->_config['twitter']['setting'];
            $this->_url             = $this->_config['twitter']['url'];
            $this->_query           = $this->_config['twitter']['query'];
            $this->_requestMethod   = $this->_config['twitter']['requestMethod'];
            $this->_numDatos        = $this->_config['twitter']['numDatos'];
            $this->_claveInicial    = $this->_config['twitter']['claveInicial'];
        }
    }

    public static function getInfoObj($json)
    {
        $Obj = new \stdClass();

        $Obj->UserName = $json->user->screen_name;
        $Obj->UserNameLink = 'https://twitter.com/' . $json->user->screen_name;
        $Obj->UserImg = $json->user->profile_image_url;
        $Obj->UserImgWidth = '';
        $Obj->UserImgHeight = '';
        $Obj->UserFullName = $json->user->name;
        $Obj->Thumbnail = FALSE;
        $Obj->ImageUrl = isset($json->image['url']) ? $json->image['url'] : FALSE;
        $Obj->ImageSizeWidth = isset($json->image['url']) ? $json->image['size']['width'] : '';
        $Obj->ImageSizeHeight = isset($json->image['url']) ? $json->image['size']['height'] : '';
        $Obj->ImagesLowResolution = FALSE;
        $Obj->Html = isset($json->html) ? $json->html : '';
        $Obj->Link = 'https://twitter.com/' . $json->user->screen_name . '/status/' . $json->id_str;
        $Obj->ImageExpandedUrl = isset($json->expanded_image_url) ? $json->expanded_image_url : FALSE;
        $Obj->ImageExpandedUrlWidth = '150';
        $Obj->CreatedTime = $json->created_time;

        return $Obj;
    }

    public function getElementos()
    {
        $array_salida = array();
        $respuesta = array();

        if (is_array($this->_arrayHashtag) && count($this->_arrayHashtag) > 0) {
            $array_salida = $this->getTwitterResponse($this->_arrayHashtag);
            $respuesta = $this->getFormatedData($array_salida);

            $this->anadirInfoImagenesTwitter($respuesta);
            $this->anadirTimestampTweets($respuesta);
            
            return $respuesta;
        }

        return $respuesta;
    }

    /**
     * Realiza la petición a la api de Twitter a partir de la query definida por configuración.
     * y devuelve los contenidos sociales en función del array de hashtags pasado por parámetro.
     * 
     * @param array $arrayHashtag
     * @return string|array
     */
    public function getTwitterResponse(array $arrayHashtag)
    {
        $respuesta = array();
        $array_salida = array();
        $clienteTwitter = new \TwitterAPIExchange($this->_setting);
        
        foreach ($arrayHashtag as $hashtag) {
            $str_query = $this->_query . $hashtag . $this->_query_param;
            try {
                $array_salida[$hashtag] = $clienteTwitter
                    ->setGetfield($str_query)
                    ->buildOauth($this->_url, $this->_requestMethod)
                    ->performRequest();
                unset($str_query);
            } catch (\Exception $ex) {
                print_r(ERROR_TWITTER);
                return $respuesta;
            }

            $msg_error = json_decode($array_salida[$hashtag]);
            
            if (isset($msg_error->errors)) {
                print_r('Twitter ' . $msg_error->errors[0]->message . ' - Codigo: ' . $msg_error->errors[0]->code);
                return $respuesta;
            }
        }
        
        // Si la respuesta es nula devolvemos un string vacio.
        if (is_null($array_salida) || count($array_salida) == 0) {
            $array_salida = '';
        }
        
        return $array_salida;
    }
    

    /**
     * Formatea los datos obtenidos de la api de Twitter para crear los índices según
     * el criterio: twitter-hashtag-id_comentario
     * 
     * @param array $twitterArray
     * @return array
     */
    public function getFormatedData(array $twitterArray)
    {
        $data = array();
        $respuesta = array();
        
        // Establecemos la salida $data hacia la clave del servicio (twitter), por cada hashTag definido en la salida.
        foreach ($twitterArray as $hashtag => $json) {
            $data[$this->_claveInicial][$hashtag] = json_decode($json);
        }
        
        foreach ($data[$this->_claveInicial] as $hashtagt => $jsonPhpT) {
            if (is_array($jsonPhpT->statuses) && count($jsonPhpT->statuses) > 0) {
                foreach ($jsonPhpT->statuses as $tweet) {
                    $id = $this->_claveInicial . '-' . $hashtagt . '-' . $tweet->id_str;
                    $respuesta[$id] = $tweet;
                    $text = property_exists($respuesta[$id], 'text') ? $respuesta[$id]->text : $respuesta[$id]->full_text;
                    $html = Twitter_Autolink::create($text)
                        ->setNoFollow(false)
                        ->addLinks();
                    $respuesta[$id]->html = $html;
                    unset($id);
                    unset($html);
                }
            } else {
                continue;
            }
        }
        
        return $respuesta;
    }
    
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
     * Devuelve los hashtags como array, a partir de un string de entrada separado
     * por comas ','
     * @param string $hashTags
     * @return array
     */
    private function getHashtagsArray($hashTags)
    {
        $array = explode(',', $hashTags);
        return array_map('trim', $array);
    }

    /**
     * Añade a los objetos de twitter la información de la primera imagen, si esta existe, y de sus dimensiones.
     * @param array $respuesta
     * @return void La información se añade directamente al objeto (por referencia)
     */
    private function anadirInfoImagenesTwitter($respuesta)
    {
        if (null !== $respuesta) {
            foreach ($respuesta as $key => $value) {
                // Imágenes por Media
                if (isset($value->entities) && isset($value->entities->media) && is_array($value->entities->media)) {
                    $media = $value->entities->media[0];

                    if ($media->type == "photo" && isset($media->media_url) && $media->media_url != "") {

                        if (isset($media->sizes)) {
                            if (isset($media->sizes->small)) {
                                $format = 'small';
                                $width = $media->sizes->small->w;
                                $height = $media->sizes->small->h;
                            } else if (isset($media->sizes->medium)) {
                                $format = 'medium';
                                $width = $media->sizes->medium->w;
                                $height = $media->sizes->medium->h;
                            } else if (isset($media->sizes->large)) {
                                $format = 'large';
                                $width = $media->sizes->large->w;
                                $height = $media->sizes->large->h;
                            } else if (isset($media->sizes->thumb)) {
                                $format = 'large';
                                $width = $media->sizes->thumb->w;
                                $height = $media->sizes->thumb->h;
                            }
                        }

                        $image = array(
                            'url' => $media->media_url,
                            'size' => array(
                                'format' => $format,
                                'width' => $width,
                                'height' => $height,
                            )
                        );
                        $value->image = $image;
                    }
                }
                // Imágenes añadidas por url
                if (isset($value->entities) && isset($value->entities->urls) && count($value->entities->urls) > 0) {
                    $urls = $value->entities->urls[0];
                    if (preg_match('/[(.jpg)(.jpeg)(.png)]+$/', $urls->expanded_url)) {
                        $value->expanded_image_url = $urls->expanded_url;
                    }
                }
            }
        }
    }

    /**
     * Añadimos a los objetos de twitter el parámetro created_time en formato unix,para poder aplicar el filtro de fecha en la vista.
     * @param array $respuesta
     * @return void La información se añade directamente al objeto (por referencia)
     */
    private function anadirTimestampTweets($respuesta)
    {
        if (null !== $respuesta) {
            foreach ($respuesta as $key => $value) {
                if (isset($value->created_at)) {
                    $date = new \DateTime($value->created_at);
                    $value->created_time = $date->getTimestamp();
                }
            }
        }
    }

    public function setQueryParams($queryParams, $objectBaneados)
    {
        //parametro de baneo
        $from = "";
        if ($objectBaneados != NULL) {
            foreach ($objectBaneados as $key => $value) {
                $from .= "-from:" . $value->UserName . " ";
            }
        }
        $this->_query_param = $from . $queryParams;
    }

}
