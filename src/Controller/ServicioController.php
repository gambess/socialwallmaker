<?php

namespace php\Controller;

use php\Controller\DataController;
use php\Librerias\Helper;
use php\Librerias\Posiciones;
use php\Factory\ApiServiceFactory;

class ServicioController
{

    private $_datosNuevos = null;
    private $_datosUsados = null;
    private $_datosBaneados;
    private $_datosEliminados;
    private $_datosBuscador;
    private $_datosEstadisticas;
    private $data;
    private $helper;
    private $editorName;
    private $config_general;
    private $config_portal;
    private $dirEditor;

    public function __construct($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL)
    {

        $this->config_general = $INI_CONFIG_EDITOR;
        $this->config_portal = $INI_CONFIG_PORTAL;

        $this->editorName = $this->config_general['editor_name'];
        $this->dirEditor = $this->config_general['path_datos_json'] . "/" . $this->editorName;

        $this->data = new DataController($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL);
        $this->helper = new Helper($INI_CONFIG_EDITOR, $INI_CONFIG_PORTAL);

        $this->data->setPathSalida($this->config_portal['tpl_salida_interna']);
        $this->data->setSalida($this->config_portal['salida_externa']);
    }

    public function getDatosUsados()
    {
        $this->_datosUsados = $this->data->cargarDatos($this->dirEditor . '_usados.php');
        $datos["datos"] = $this->_datosUsados;
        return $this->getArrayVista($datos);
    }

    public function getPortada()
    {
        $this->_datosNuevos = $this->data->cargarDatos($this->dirEditor . '_respuesta.php');
        $this->_datosUsados = $this->data->cargarDatos($this->dirEditor . '_usados.php');
        $this->_datosBaneados = $this->data->cargarDatos($this->dirEditor . '_baneados.php');
        $this->_datosEliminados = $this->data->cargarDatos($this->dirEditor . '_eliminados.php');
        $this->_datosBuscador = $this->data->cargarDatos($this->dirEditor . '_buscador.php');
        $this->_datosEstadisticas = $this->data->cargarDatos($this->dirEditor . '_estadisticas.php');
        


        $this->borrarFicheros('_estadisticas.php');

        $datosEstadisticas = array();
        $ObjUsados = $this->helper->infoJsonToObj($this->_datosUsados);
        $ObjUsados->datos = $this->helper->dividirObjPorServicio($ObjUsados->datos);
        $this->helper->defineDefaultActiveTab($ObjUsados);
        
        
        $ObjRespuesta = $this->helper->infoJsonToObj($this->_datosNuevos);
        $ObjRespuesta->datos = $this->helper->dividirObjPorServicio($ObjRespuesta->datos);
        $this->helper->defineDefaultActiveTab($ObjRespuesta);

        $ObjBaneados = $this->helper->infoJsonToObj($this->_datosBaneados);

        $ObjEliminados = $this->helper->infoJsonToObj($this->_datosEliminados);

        if (!empty($this->_datosBuscador)) {
            $ObjBusqueda = $this->helper->infoJsonToObj($this->_datosBuscador['buscador']);
            $ObjBusqueda->datos = $this->helper->dividirObjPorServicio($ObjBusqueda->datos);
            $ObjBusqueda->searchInput = !isset($this->_datosBuscador['searchInput']) ? '' : $this->_datosBuscador['searchInput'];
            $this->helper->defineDefaultActiveTab($ObjBusqueda);
        } else {
            $ObjBusqueda = $this->helper->infoJsonToObj($this->_datosBuscador);
            $ObjBusqueda->datos = $this->helper->dividirObjPorServicio($ObjBusqueda->datos);
            $this->helper->defineDefaultActiveTab($ObjBusqueda);
        }
        

        $datos["nuevos"] = $ObjRespuesta;
        $datos["usados"] = $ObjUsados;
        $datos["baneados"] = $ObjBaneados;
        $datos["eliminados"] = $ObjEliminados;
        $datos["estadisticas"] = $this->_datosEstadisticas;
        $datos['buscador'] = isset($ObjBusqueda) ? $ObjBusqueda : NULL;

        return $datos;
    }

    public function buscarHashtag()
    {
        $datos['searchInput'] = "";
        if (isset($_POST['buscar']) && !empty($_POST['buscar'])) {
            $hastag = $_POST['buscar'];
            $datos['searchInput'] = $hastag;
            $datos['buscador'] = $this->getDatosAPIs($hastag);
            $full_nombre = $this->dirEditor . '_buscador.php';
            $this->data->guardarArchivo($full_nombre, $datos);
        }else{
            $this->borrarFicheros('_buscador.php');
        }
    }

    public function borrarImagenes()
    {
        $estadisticas = array();
        $array_ids = $_POST['option-delete'];
        $datosUsados = $this->data->cargarDatos($this->dirEditor . '_usados.php');

        $ntu = count($datosUsados);
        $contadorBorrados = 0;
        foreach ($array_ids as $id) {
            if (array_key_exists($id, $datosUsados)) {
                if (isset($datosUsados[$id])) {
                    unset($datosUsados[$id]);
                    $contadorBorrados++;
                    $ntu--;
                }
            }
        }

        $this->data->guardarArchivo($this->dirEditor . '_usados.php', $datosUsados);

        $info['datos'] = $this->helper->infoJsonToObj($datosUsados);
        $estadisticas['borrarNumeroElementosTotal'] = $ntu;
        $estadisticas['borrarNumeroElementosNuevos'] = $ntu;
        $estadisticas['borrarNumeroElementosBorrar'] = $contadorBorrados;
        $estadisticas['publicarNumeroElementosEliminados'] = 0;
        $estadisticas['publicarNumeroElementosBaneados'] = 0;
        $estadisticas['recuperadosNumeroElementosRecuperados'] = 0;
        $estadisticas['numeroElementosObtenidosTotal'] = 0;
        $estadisticas['publicarNumeroElementosNuevos'] = 0;
        $estadisticas['publicarNumeroElementosUsados'] = 0;
        $estadisticas['publicarNumeroElementosTotal'] = 0;
        
        $full_nombre_estadisticas = $this->dirEditor . '_estadisticas.php';
        $this->data->guardarArchivo($full_nombre_estadisticas, $estadisticas);

        $pos = new Posiciones($this->config_general, $this->config_portal);
        $posiciones = $pos->borrarPosiciones($array_ids);
        $info = array_merge($info, $posiciones);

        return $info;
    }

    public function deshacer($post, $suf_file)
    {
        $datosDeshacer = array();
        $estadisticas = array();
        $contadorRecuperados = 0;
        $ntu = 0;
        if (isset($post)) {
            $datosDeshacer = $this->data->cargarDatos($this->dirEditor . $suf_file . '.php');
            $ntu = count($datosDeshacer);
            foreach ($post as $id) {
                if (array_key_exists($id, $datosDeshacer)) {
                    unset($datosDeshacer[$id]);
                }
                $contadorRecuperados++;
            }

            $this->data->guardarArchivo($this->dirEditor . $suf_file . '.php', $datosDeshacer);
        }

        $info['numeroElementosTotal'] = $ntu;
        $info['numeroElementosNuevos'] = $ntu;
        $info['numeroElementosBorrar'] = $contadorRecuperados;

        $estadisticas['recuperadosNumeroElementosTotal'] = $ntu;
        $estadisticas['recuperadosNumeroElementosRecuperados'] = $contadorRecuperados;

        $full_nombre_estadisticas = $this->dirEditor . '_estadisticas.php';
        $this->data->guardarArchivo($full_nombre_estadisticas, $estadisticas);

        return $info;
    }

    public function generarMuro()
    {
        $estadisticas = array();
        $datosBaneado = array();
        $datosEliminados = array();
        $info = array();
        $option = isset($_POST['option']) ? $_POST['option'] : FALSE;
        $banear = isset($_POST['banear']) ? $_POST['banear'] : FALSE;
        $eliminar = isset($_POST['eliminar']) ? $_POST['eliminar'] : FALSE;

        $datosRespuesta = $this->data->cargarDatos($this->dirEditor . '_respuesta.php');
        $estadisticas['publicarNumeroElementosEliminados'] = 0;
        $estadisticas['publicarNumeroElementosBaneados'] = 0;
        $estadisticas['borrarNumeroElementosTotal'] = 0;
        $estadisticas['borrarNumeroElementosNuevos'] = 0;
        $estadisticas['borrarNumeroElementosBorrar'] = 0;
        $estadisticas['recuperadosNumeroElementosRecuperados'] = 0;

        if ($banear) {
            $estadisticas['publicarNumeroElementosBaneados'] = count($banear);
            $Baneados = $this->data->cargarDatos($this->dirEditor . '_baneados.php');
            $datosBaneado = $this->helper->mergeDataFile($banear, $Baneados, $datosRespuesta);
            $this->_datosBaneados = $datosBaneado['datos'];

            if ($datosBaneado["datos"] != 0) {
                $this->data->guardarArchivo($this->dirEditor . '_baneados.php', $datosBaneado['datos']);
            }
        }

        if ($eliminar) {
            $estadisticas['publicarNumeroElementosEliminados'] = count($eliminar);
            $Eliminados = $this->data->cargarDatos($this->dirEditor . '_eliminados.php');
            $datosEliminados = $this->helper->mergeDataFile($eliminar, $Eliminados, $datosRespuesta);
            $this->_datosEliminados = $datosEliminados['datos'];

            if ($datosEliminados["datos"] != 0) {
                $this->data->guardarArchivo($this->dirEditor . '_eliminados.php', $datosEliminados['datos']);
            }
        }

        //borramos uno por uno a cada usuario baneado para no recargar el fichero respuesta
        $datosRespuesta = $this->banearUsuario($datosRespuesta);
        //borramos uno por uno a cada tweet eliminado para no recargar el fichero respuesta
        $datosRespuesta = $this->deleteTweet($datosRespuesta);

        if ($option) {
            $datosUsados = $this->data->cargarDatos($this->dirEditor . '_usados.php');
            $info = $this->helper->mergeDataFile($option, $datosUsados, $datosRespuesta);
            $this->_datosUsados = $info['datos'];
            // Si no hay nuevos elementos a publicar no generamos la salida, ya que se generará vacía.
            if ($info["datos"] != 0) {
                $this->data->guardarArchivo($this->dirEditor . '_usados.php', $info["datos"]);
                $merge['datos'] = $this->helper->ordenarMuro($info["datos"]);
            }

            //Si se ha configurado en config.ini las posiciones se ejecuta este codigo
            $pos = new Posiciones($this->config_general, $this->config_portal);
            $posiciones = $pos->gestionarPosiciones($option);
            $info = array_merge($info, $posiciones);
        }

        if (isset($info['datos'])) {
            $info['datos'] = $this->helper->infoJsonToObj($info['datos']);
            $estadisticas['estadisticasInfo'] = $info['datos']->estadistica;
            $estadisticas['publicarNumeroElementosNuevos'] = $info['numeroElementosNuevos'];
            $estadisticas['publicarNumeroElementosUsados'] = $info['numeroElementosUsados'];
            $estadisticas['publicarNumeroElementosTotal'] = $info['numeroElementosTotal'];
            $estadisticas['numeroElementosAnadidos'] = $info['numeroElementosNuevos'];
            $estadisticas['numeroElementosExistentes'] = $info['numeroElementosUsados'];
            $estadisticas['numeroElementosObtenidosTotal'] = $info['numeroElementosTotal'];
            $estadisticas['obtenidosNumeroElementosUsados'] = $info['numeroElementosUsados'];
        }

        $full_nombre_estadisticas = $this->dirEditor . '_estadisticas.php';
        $this->data->guardarArchivo($full_nombre_estadisticas, $estadisticas);

        return $info;
    }

    public function cargaFicheroRespuesta()
    {
        $full_nombre = $this->dirEditor . '_respuesta.php';
        $datos = array();
        if (!file_exists($full_nombre)) {
            $datos = $this->getDatosAPIs();
            $this->data->guardarArchivo($full_nombre, $datos);
        } else {
            $datos = $this->data->cargarDatos($full_nombre);
        }
        return $datos;
    }

    public function borrarFicheros($fichero)
    {
        $this->helper->borrarResponseData($this->dirEditor . $fichero);
    }

    public function enviarBusqueda()
    {
        $estadisticas = array();
        $buscador = array();
        $respuesta = $this->data->cargarDatos($this->dirEditor . '_respuesta.php');
        $buscador_all = $this->data->cargarDatos($this->dirEditor . '_buscador.php');

        if (isset($buscador_all['buscador'])) {
            $buscador = $buscador_all['buscador'];
        }

        if (isset($_POST['search'])) {
            $post = $_POST['search'];

            $respuesta = $this->helper->mergeDataFile($post, $respuesta, $buscador);

            $estadisticas['numeroElementosAnadidos'] = $respuesta['numeroElementosNuevos'];
            $estadisticas['numeroElementosExistentes'] = $respuesta['numeroElementosUsados'];
            $estadisticas['numeroElementosObtenidosTotal'] = $respuesta['numeroElementosTotal'];
            $estadisticas['publicarNumeroElementosNuevos'] = $respuesta['numeroElementosNuevos'];
            $estadisticas['publicarNumeroElementosUsados'] = $respuesta['numeroElementosUsados'];
            $estadisticas['publicarNumeroElementosTotal'] = $respuesta['numeroElementosTotal'];
            $estadisticas['numeroElementosAnadidos'] = $respuesta['numeroElementosNuevos'];
            $estadisticas['numeroElementosExistentes'] = $respuesta['numeroElementosUsados'];
            $estadisticas['obtenidosNumeroElementosUsados'] = $respuesta['numeroElementosUsados'];
            $estadisticas['publicarNumeroElementosBaneados'] = 0;
            $estadisticas['publicarNumeroElementosEliminados'] = 0;
            $estadisticas['borrarNumeroElementosBorrar'] = 0;
            $estadisticas['borrarNumeroElementosTotal'] = 0;
            $estadisticas['recuperadosNumeroElementosRecuperados'] = 0;

            if (is_array($respuesta['datos'])) {
                $full_nombre = $this->dirEditor . '_respuesta.php';
                $this->data->guardarArchivo($full_nombre, $respuesta['datos']);
                $this->borrarFicheros('_buscador.php');
            }

            $full_nombre_estadisticas = $this->dirEditor . '_estadisticas.php';
            $this->data->guardarArchivo($full_nombre_estadisticas, $estadisticas);
        }

        return;
    }

    private function banearUsuario($respuesta)
    {
        $contadorBorrados = 0;
        if (!is_null($this->_datosBaneados) && is_array($this->_datosBaneados)) {
            //recorremos baneados
            foreach ($this->_datosBaneados as $id => $value) {
                $currentService = explode('-', $id);
                
                $servicio = ApiServiceFactory::createService($currentService[0]);
                
                $info = $servicio::getInfoObj($value);
                $userName = $info->UserName;
                //recorremos respuesta
                foreach ($respuesta as $idResp => $valueResp) {
                    $currentServiceResp = explode('-', $idResp);
                    $servicioResp = ApiServiceFactory::createService($currentServiceResp[0]);
                    $infoResp = $servicioResp::getInfoObj($valueResp);
                    $userNameResp = $infoResp->UserName;
                    if ($userName == $userNameResp) {
                        unset($respuesta[$idResp]);
                        $contadorBorrados++;
                    }
                }
            }
        }
        return $respuesta;
    }

    private function deleteTweet($respuesta)
    {
        $this->_datosEliminados = $this->data->cargarDatos($this->dirEditor . '_eliminados.php');
        $contadorBorrados = 0;
        if (!is_null($this->_datosEliminados) && is_array($this->_datosEliminados)) {
            foreach ($this->_datosEliminados as $id => $value) {
                if (in_array($id, array_keys($respuesta))) {
                    unset($respuesta[$id]);
                    $contadorBorrados++;
                }
            }
        }
        return $respuesta;
    }

    public function getDatosAPIs($hastag = null)
    {
        $respuesta = array();
        $elementos = array();

        $this->_datosBaneados = $this->data->cargarDatos($this->dirEditor . '_baneados.php');
        $ObjBaneados = $this->helper->infoJsonToObj($this->_datosBaneados);
        $ObjBaneados = $this->helper->dividirObjPorServicio($ObjBaneados->datos);
        
        $array = explode(',', $this->config_portal['servicio_activar']);
        $servicios = array_map('trim', $array);
        
        
        foreach ($servicios as $servicio) {
            $api = ApiServiceFactory::createService($servicio);

            if ($api !== null) {
                // Si definimos un hastag por parámetro usarmos éste para la búsqueda, de lo
                // contrario emplearemos los definidos por configuración.
                $hastags = null !== $hastag ? str_replace('#', '', $hastag) : $this->config_portal[$servicio . '_hashtags'];

                $api->setHashTags($hastags);
                if (isset($this->config_portal[$servicio . '_query_params'])) {
                    $api->setQueryParams($this->config_portal[$servicio . '_query_params'], $ObjBaneados->$servicio);
                }

                $elementos = $api->getElementos();

                if (count($elementos) > 0) {
                    $respuesta = array_merge($respuesta, $elementos);
                }
            }
        }

        $respuestaOut = $this->deleteTweet($respuesta);
        return $respuestaOut;
    }

}
