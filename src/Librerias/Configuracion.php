<?php

namespace php\Librerias;

abstract class Configuracion
{

    protected static $configuracionGlobal = array();

    /**
     * Devuelve la configuración general del portal específico al hashtag indicado
     * en la constante MI_PORTAL ($nombrePortal).
     * Aplicamos el patrón Singleton para la lectura de la configuración del portal.
     * 
     * @return array
     */
    public static function getConfiguracion($archivo_ini, $nombre_seccion)
    {
        self::cargarConfiguracionGlobal($archivo_ini);

        if (!isset(self::$configuracionGlobal[$nombre_seccion])) {
            print_r(HASHTAG_NAME_NOT_EXISTS);
        }

        return self::$configuracionGlobal[$nombre_seccion];
    }

    /**
     * Carga la configuración global del editor en la variable estática $config.
     * Aplicamos el patrón Singleton para la lectura de la configuración global.
     */
    public static function cargarConfiguracionGlobal($archivo_ini)
    {
        if (count(self::$configuracionGlobal) == 0) {
            self::$configuracionGlobal = self::cargarConfiguracionArchivo($archivo_ini);
        }
    }

    /**
     * Devuelve un array con la configuración del fichero a partir de su ruta.
     * @param string $ruta
     * @return array
     */
    public static function cargarConfiguracionArchivo($archivo_ini)
    {
        return self::parse($archivo_ini, true);
    }

    /**
     * Parsea arrays multidimensionales para archivos de configuración .ini
     * 
     * @param string $archivo_ini
     * @param boolean $process_sections
     * @param string $scanner_mode
     * 
     * @return array
     */
    public static function parse($archivo_ini, $process_sections = false, $scanner_mode = INI_SCANNER_NORMAL)
    {
        $explode_str = '.';
        $escape_char = "'";
        // load ini file the normal way
        $data = parse_ini_file($archivo_ini, $process_sections, $scanner_mode);
        if (!$process_sections) {
            $data = array($data);
        }
        foreach ($data as $section_key => $section) {
            // loop inside the section
            foreach ($section as $key => $value) {
                if (strpos($key, $explode_str)) {
                    if (substr($key, 0, 1) !== $escape_char) {
                        // key has a dot. Explode on it, then parse each subkeys
                        // and set value at the right place thanks to references
                        $sub_keys = explode($explode_str, $key);
                        $subs = & $data[$section_key];
                        foreach ($sub_keys as $sub_key) {
                            if (!isset($subs[$sub_key])) {
                                $subs[$sub_key] = array();
                            }
                            $subs = & $subs[$sub_key];
                        }
                        // set the value at the right place
                        $subs = $value;
                        // unset the dotted key, we don't need it anymore
                        unset($data[$section_key][$key]);
                    }
                    // we have escaped the key, so we keep dots as they are
                    else {
                        $new_key = trim($key, $escape_char);
                        $data[$section_key][$new_key] = $value;
                        unset($data[$section_key][$key]);
                    }
                }
            }
        }
        if (!$process_sections) {
            $data = $data[0];
        }
        return $data;
    }

}
