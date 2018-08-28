<?php

namespace php\Controller;

use php\Librerias\Configuracion;
use php\Controller\ServicioController;
use php\Controller\VistaController;

class EditorController
{

    private $servicio, $vista;
    
    function __construct()
    {

        // Leemos la configuración del general editor, portal y servicios.
        $INI_CONFIG_EDITOR = Configuracion::getConfiguracion(PATH_CONFIGURACION, 'editor');
        $INI_CONFIG_PORTAL = Configuracion::getConfiguracion(PATH_CONFIGURACION, MI_PORTAL);

        $this->servicio = new ServicioController($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL);
        $this->vista = new VistaController($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL);
    }

    public function indexAction()
    {
        
    }

    public function portadaAction()
    {
        
        $datos = $this->servicio->getPortada();
        $this->vista->muestraPortada($datos);
        
    }

    public function recargarAction()
    {
        $this->servicio->borrarFicheros('_respuesta.php');
        $this->servicio->cargaFicheroRespuesta();
        $this->portadaAction();
    }

    public function generarAction()
    {
        $datos = $this->servicio->generarMuro();
        // Si no hay nuevos elementos a publicar no generamos la salida, ya que se generará vacía.
        if (isset($datos['datos']) && !is_null($datos['datos']->datos)) {
            $this->vista->generaSalida($datos);
        }
        $this->portadaAction();
    }

    public function borrarAction()
    {
        $datos = $this->servicio->borrarImagenes();
        $this->vista->generaSalida($datos);
        $this->portadaAction();
    }

    public function buscarAction()
    {
        $this->servicio->buscarHashtag();
        $this->portadaAction();
    }

    public function enviarObtenidosAction()
    {
        $this->servicio->enviarBusqueda();
        $this->portadaAction();
    }

    public function desbanearAction()
    {
        $datos = $this->servicio->deshacer($_POST['deshacer_baneado'], '_baneados');
        $this->portadaAction();
    }

    public function deseliminarAction()
    {
        $datos = $this->servicio->deshacer($_POST['deshacer_eliminado'], '_eliminados');
        $this->portadaAction();
    }

    /**
     * devuelve paginas cuyos datos se envian por post
     * @param type $output
     * @return type
     */
    public function indexAjaxArray($output)
    {
        if (isset($_SESSION['PeopleFlow']) && $_SESSION['PeopleFlow'] == 1) {
            if (isset($output['main'])) {
                $output['main'] = $this->getAnonymous($output['main']);
            }
        }
        return json_encode($output);
    }

}
