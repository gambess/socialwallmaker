<?php

namespace php\Librerias;

use php\Factory\ApiServiceFactory;

class Helper
{

    private $config_general;
    private $config_portal;
    private $servicios_disponibles = array();

    function __construct($INI_CONFIG_GENERAL, $INI_CONFIG_PORTAL)
    {
        $this->config_general = $INI_CONFIG_GENERAL;
        $this->config_portal = $INI_CONFIG_PORTAL;
        
        $array = explode(',', $this->config_portal['servicio_activar']);
        $servicios = array_map('trim', $array);

        foreach ($servicios as $servicio) {
            array_push($this->servicios_disponibles, $servicio);
        }
    }

    public function borrarResponseData($fulnombre)
    {
        if (file_exists($fulnombre))
            unlink($fulnombre);
    }

    private function createObjServicio()
    {
        $Obj = new \stdClass();
        foreach ($this->servicios_disponibles as $servicio) {
            $Obj->{$servicio} = 0;
        }
        return $Obj;
    }

    public function dividirObjPorServicio($Obj)
    {
        $ObjDividido = $this->createObjServicio();

        if (!is_null($Obj)) {
            foreach ($Obj as $id => $value) {
                $currentService = explode('-', $id);
                if(!is_object($ObjDividido->{$currentService[0]})) {
                    $ObjDividido->{$currentService[0]} = new \stdClass();
                }
                $ObjDividido->{$currentService[0]}->{$id} = $value;
            }
        }

        return $ObjDividido;
    }

    public function infoJsonToObj($datos)
    {
        $ObjEstadistica = $this->createObjServicio();
        
        if (count($datos) == 0 || is_null($datos) || $datos == 0) {
            $Obj = NULL;
            //si $ObjEstadistica->$currentService[0] no existe le creamos una clase vacia
        } else {

            $Obj = new \stdClass();
            foreach ($datos as $id => $value) {
                $currentService = explode('-', $id);
                
                if (!isset($ObjEstadistica->{$currentService[0]})) {
                    $ObjEstadistica->{$currentService[0]} = 0;
                }

                $servicio = ApiServiceFactory::createService($currentService[0]);
                
                $info = $servicio::getInfoObj($value);
                $Obj->{$id} = $info;
                $ObjEstadistica->{$currentService[0]} = $ObjEstadistica->{$currentService[0]} + count($value);
            }
        }

        $ObjOut = new \stdClass();
        $ObjOut->datos = $Obj;
        $ObjOut->estadistica = $ObjEstadistica;

        return $ObjOut;
    }

    public function defineDefaultActiveTab($datos)
    {
        $firstActive = true;
        $active = 'active in';
        $numRegistrosTotales = $this->getNumeroRegistroTotales($datos->estadistica);
        
        $defaultActiveTab = new \stdClass();        
        foreach ($datos->datos as $key => $value) {

            if (($firstActive && $numRegistrosTotales == 0 || $datos->estadistica->{$key} > 0 && $numRegistrosTotales != 0) && $firstActive == true) {
                $defaultActiveTab->{$key} = $active;
                $firstActive = false;
//                continue;
            } else {
                $defaultActiveTab->{$key} = '';
//                continue;
            }
            
        }
        $datos->defaultActiveTab = $defaultActiveTab;
    }
    
    

    public function getNumeroRegistroTotales($registros)
    {
        $numero = 0;
        
        foreach ($registros as $key => $value) {
            $numero += $value;
        }
        
        return $numero;
    }

    public function ordenarMuro($elementos_a_publicar)
    {
        if (!is_null($elementos_a_publicar)) {
            $aux = array();
            $i = 1;
            foreach ($elementos_a_publicar as $key => $row) {
                if(isset($row->created_time)) {
                    $aux[$key] = $row->created_time;
                    continue;
                }
                if(isset($row->date)) {
                    $aux[$key] = $row->date;
                    continue;
                }
                
                $i++;
            }
            array_multisort($aux, SORT_DESC, $elementos_a_publicar);
        }

        return $elementos_a_publicar;
    }

    public function mergeDataFile($post, $datosExists, $datosRespuesta)
    {
        $numeroElementosNuevos = 0;
        $numeroElementosUsados = 0;
        $datosNuevos = array();

        foreach ($post as $option) {
            if (array_key_exists($option, $datosExists)) {
                $numeroElementosUsados++;
            } else {
                if (isset($datosRespuesta[$option])) {
                    $numeroElementosNuevos++;
                    $dato = $datosRespuesta[$option];
                    $datosNuevos[$option] = $dato;
                }
            }
        }

        $merge = array();
        if (count($datosNuevos) > 0) {
            if (count($datosExists) > 0) {
                $merge = array_merge($datosNuevos, $datosExists);
            } else {
                $merge = $datosNuevos;
            }
            $datosExists = $merge;
        }

        if ($numeroElementosNuevos > 0 && count($datosExists) > 0) {
            $out["datos"] = $datosExists;
        } else {
            $out["datos"] = 0;
        }

        $out['numeroElementosNuevos'] = $numeroElementosNuevos;
        $out['numeroElementosUsados'] = $numeroElementosUsados;
        $out['numeroElementosTotal'] = count($out['datos']);

        return $out;
    }

}
