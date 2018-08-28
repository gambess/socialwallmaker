<?php

namespace php\Librerias;

use php\Controller\DataController;

class Posiciones
{

    private $config_general;
    private $config_portal;
    private $_posicionesLibres;
    private $arrayPosiciones;
    private $_posicionesNoUsar;
    private $_numeroPosiciones;
    private $dirEditor;
    private $_posicionesEnEstaEjecucion = array();

    function __construct($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL)
    {
        $this->config_general = $INI_CONFIG_EDITOR;
        $this->config_portal = $INI_CONFIG_PORTAL;
        
        $this->editorName = $this->config_general['editor_name'];
        $this->dirEditor = $this->config_general['path_datos_json'] . "/" . $this->editorName;

        $this->_posicionesLibres = isset($this->config_portal['posiciones_libres']) ? explode(',', $this->config_portal['posiciones_libres']) : NULL;
        $this->_posicionesNoUsar = isset($this->config_portal['posiciones_noUsar']) ? explode(',', $this->config_portal['posiciones_noUsar']) : NULL;
        $this->_numeroPosiciones = isset($this->config_portal['posiciones_numero']) ? (int) $this->config_portal['posiciones_numero'] : NULL;

        $this->data = new DataController();
        $this->arrayPosiciones = $this->data->cargarDatos($this->dirEditor . '_posiciones.php');
    }

    public function gestionarPosiciones($option)
    {
        $this->setNumeroPosiciones();
        $this->setPosicionesLibres();
        $this->setPosicionesNoUsar();

        $full_nombre = $this->dirEditor . '_posiciones.php';
        $this->arrayPosiciones = $this->data->cargarDatos($full_nombre);
        $out = array();
        if ($this->_posicionesLibres != NULL && $this->_posicionesNoUsar != NULL) {
            $out['posiciones'] = array();
            foreach ($option as $opt) {
                $posicion = $this->damePosicionAleatoria();
                $this->arrayPosiciones[$posicion] = $opt;
            }
            $out['posiciones'] = $this->arrayPosiciones;
            $out['numeroPosiciones'] = $this->_numeroPosiciones;
            $out['posicionesNoUsar'] = $this->_posicionesNoUsar;
            $this->data->guardarArchivo($this->dirEditor . '_posiciones.php', $out['posiciones']);
        }
        return $out;
    }

    public function borrarPosiciones($array_ids)
    {
        $this->setNumeroPosiciones();
        $info = array();
        $this->arrayPosiciones = $this->data->cargarDatos($this->dirEditor . '_posiciones.php');
        if (count($this->arrayPosiciones) != 0) {
            foreach ($array_ids as $id) {
                $posicion = array_search($id, $this->arrayPosiciones);
                unset($this->arrayPosiciones[$posicion]);
            }
            $full_nombre = $this->dirEditor . '_posiciones.php';
            $this->data->guardarArchivo($full_nombre, $this->arrayPosiciones);

            $info['posiciones'] = $this->arrayPosiciones;
            $info['numeroPosiciones'] = $this->_numeroPosiciones;
            $info['posicionesNoUsar'] = $this->_posicionesNoUsar;
        }
        return $info;
    }

    private function setNumeroPosiciones()
    {
        if ($this->_numeroPosiciones <= 0 || $this->_numeroPosiciones > 5000) {
            $this->_numeroPosiciones = 2000;
        }
    }

    private function setPosicionesLibres()
    {
        if (is_array($this->_posicionesLibres) && count($this->_posicionesLibres) == 0)
            $this->_posicionesLibres = array(5, 40, 50, 96, 120, 122, 140, 141, 205, 217, 253, 258, 268, 287, 338, 352, 370, 372, 388, 399, 426, 450, 457, 470, 499, 509, 522, 526, 528, 540, 549, 554, 577, 578, 613, 615, 636, 662, 693, 707, 721, 745, 770, 790, 813, 829, 853, 865, 877, 879, 934, 979, 1010, 1023);
    }

    private function setPosicionesNoUsar()
    {
        if (is_array($this->_posicionesNoUsar) && count($this->_posicionesNoUsar) == 0)
            $this->_posicionesNoUsar = array(1, 9, 10, 13, 14, 22, 23, 27, 78, 79, 106, 107, 108, 109, 110, 153, 230, 279, 463, 472, 558, 640, 714, 798, 898, 1914, 1915, 1916, 1917, 1918, 1919, 1920);
    }

    private function damePosicionAleatoria()
    {
        $numeroPosicionesUsadas = count($this->arrayPosiciones);

        $arrayPosicionesProhibidas = array_merge($this->_posicionesNoUsar, $this->_posicionesLibres);
        $posicionesLibres = $this->_numeroPosiciones - $numeroPosicionesUsadas - count($arrayPosicionesProhibidas);

        // Solo sale del while cuando encuentra una posición valida.
        $posicionValida = false;
        while (!$posicionValida) {
            $tmpPosicion = rand(1, $this->_numeroPosiciones);

            if ($posicionesLibres > 0) {
                if (!in_array($tmpPosicion, $arrayPosicionesProhibidas) && !array_key_exists($tmpPosicion, $this->arrayPosiciones) && !in_array($tmpPosicion, $this->_posicionesEnEstaEjecucion)) {
                    $posicionValida = true;
                }
            } else {
                if (!in_array($tmpPosicion, $arrayPosicionesProhibidas) && !in_array($tmpPosicion, $this->_posicionesEnEstaEjecucion)) {
                    $posicionValida = true;
                }
            }
        }

        $this->_posicionesEnEstaEjecucion[] = $tmpPosicion;

        return $tmpPosicion;
    }

}
