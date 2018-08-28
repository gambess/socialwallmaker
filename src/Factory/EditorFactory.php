<?php

namespace php\Factory;

class EditorFactory 
{
    private $context = 'common-editor';

    /**
     * Crea la instancia del editor común
     * 
     * @param string $editor
     * @param array $options
     * 
     * @return \Editor
     */
    public static function createEditor(array $options = array())
    {
        return new Editor($options);
    }

}
