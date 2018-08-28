<?php

namespace php\Controller;

class DataController
{

    private $_pathSalida = null;
    private $_salida = null;

    function __construct()
    {

    }

    public function getPathSalida()
    {
        return $this->_pathSalida;
    }

    public function setPathSalida($path)
    {
        $this->_pathSalida = $path;
    }

    public function getSalida()
    {
        return $this->_salida;
    }

    public function setSalida($out)
    {
        $this->_salida = $out;
    }

    private function dataResponse($full_nombre)
    {
        return unserialize(file_get_contents($full_nombre));
    }

    public function cargarDatos($full_nombre)
    {
        $editor = array();
        if (file_exists($full_nombre)) {
            $editor = $this->dataResponse($full_nombre);
        }
        return $editor;
    }

    public function guardarArchivo($ruta, array $datos = array())
    {
        file_put_contents($ruta, serialize($datos));
    }

}
