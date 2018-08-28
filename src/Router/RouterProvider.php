<?php

namespace php\Router;

use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\Generator\UrlGenerator;
use php\Librerias\Configuracion;

class RouterProvider
{

    private $context;
    private $matcher;
    private $match = array();
    private $launcher = null;
    private $urlGenerator;
    private $baseUri;
    private $routes = array();
    private $arrayRoutes;

    public function __construct($archivo_ini)
    {
        $this->baseUri = $_SERVER['SCRIPT_NAME'];
        $this->context = new RequestContext();
        $this->arrayRoutes = Configuracion::cargarConfiguracionArchivo($archivo_ini);
        

        $this->matcher = new UrlMatcher($this->getRouteColletion(), $this->context);
        $this->urlGenerator = new UrlGenerator($this->getRouteColletion(), $this->context);
        
        if (isset($_SERVER['PATH_INFO']) && $this->launcher == null) {
            $this->match = $this->matcher->match(rtrim($_SERVER['PATH_INFO'], "/"));
            $this->launcher = $this->createLauncher($this->match);
        } else {
            throw new \Exception(HASHTAG_NOT_URL);
        }
    }

    /**
     * Desde aquí creamos la colección de las instancias de las rutas.
     * @return RouteCollection
     */
    public function getRouteColletion()
    {
        $this->routes = new RouteCollection();

        foreach ($this->arrayRoutes as $mi_potal => $value) {
            $this->routes->add($mi_potal, new Route($value['route'], array('controller' => $value['controller'] . ':' . $value['action'])));
        }

        return $this->routes;
    }

    /**
     * Ejecuta el controlador y método definido por el routing a partir del objeto
     * launcher. E injecta los parámetros de la query al método invocado.
     * 
     * @return mixed
     */
    public function launchController()
    {
        $controller = new $this->launcher->controller();
        $method = $this->launcher->method;
                
        $params = array();
        if (isset($this->launcher->params)) {
            $params = $this->launcher->params;
        }

        $controller->$method();
    }

    /**
     * Ejecuta el controlador y método definido por el routing a partir del objeto
     * launcher. E injecta los parámetros de la query al método invocado.
     * 
     * @return mixed
     */
    public function getMatch()
    {
        return $this->match;
    }

    /**
     * Genera la ruta a partir del nombre de ruta y sus parámetros.
     * 
     * @param string $routeName Nombre de la ruta a generar.
     * @param array $params Array de parámetros pertenecientes a la ruta.
     * 
     * @return string
     */
    public function path($routeName, array $params = array())
    {
        return $this->baseUri . $this->urlGenerator->generate($routeName, $params);
    }

    /**
     * Devuelve el nombre de la ruta activa.
     * 
     * @return string | null
     */
    public function activeRouteName()
    {
        if (isset($this->match['_route'])) {
            return $this->match['_route'];
        }

        return null;
    }

    /**
     * Devuelve la uri base del editor actual hasta el hashtag.
     * 
     * @return string
     */
    public function getBaseUriEditor()
    {
        return $this->baseUri . '/' . $this->match['hashtag'];
        
    }

    /**
     * Crea el objeto launcher encargado de lanzar el controlador. Este objeto contiene
     * el nombre del controlador, metodo y parámetros necesarios para lanzar el controlador.
     * 
     * @param array $match array obtenido del objeto matcher->match().
     * 
     * @return stdClass $launcher
     */
    private function createLauncher(array $match = array())
    {
        $launcher = new \stdClass();
        if (count($match) > 0) {
            foreach ($match as $key => $value) {
                if ($key === 'controller') {
                    $reflector = explode(':', $value);
                    $launcher->controller = isset($reflector[0]) ? $reflector[0] : '';
                    $launcher->method = isset($reflector[1]) ? $reflector[1] : '';
                } else if ($key === '_route') {
                    $launcher->_route = $value;
                } else {
                    $launcher->params[$key] = $value;
                }
            }
        }

        return $launcher;
    }

}
