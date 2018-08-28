<?php

namespace php\Controller;

use php\Factory\OutputModelFactory;

class VistaController
{

    private $config_general;
    private $config_portal;

    public function __construct($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL)
    {
        $this->config_general = $INI_CONFIG_EDITOR;
        $this->config_portal = $INI_CONFIG_PORTAL;
    }

    public function muestraPortada($datos)
    {
        $datos['title_editor'] = $this->config_portal['titulo_editor'];
        $tpl = $this->config_general['tpl_portada'];
//        echo "<pre>";
//        print_r($datos['nuevos']);die;
        echo OutputModelFactory::generaOutput(OutputModelFactory::HTML, $datos, $tpl);
    }

    public function generaSalida($datos)
    {
        $array_tipo_salida = explode(',', $this->config_portal['tipo_salida']);

        foreach ($array_tipo_salida as $tipo_salida) {
            $this->renderView($this->config_portal['tpl_salida_interna'], $this->config_portal['salida_externa'], $datos, $tipo_salida);
            
            if (isset($this->config_portal['tpl_salida_interna_2']) && isset($this->config_portal['salida_externa_2'])) {
                $this->renderView($this->config_portal['tpl_salida_interna_2'], $this->config_portal['salida_externa_2'], $datos, $tipo_salida);
            }
        }
    }
    
    private function renderView($tpl_entrada, $html_salida, $datos, $tipo_salida)
    {
        $tpl = $tpl_entrada . '.' . strtolower($tipo_salida) . '.tpl';
        $output = OutputModelFactory::generaOutput($tipo_salida, $datos, $tpl);
        $file_salida = $html_salida . '.' . strtolower($tipo_salida);
        
        if (preg_match('/.shtml/mi', $file_salida)) {
            $file_salida = str_replace('.html', '', $file_salida);
        }
        file_put_contents($file_salida, $output);
    }

}
