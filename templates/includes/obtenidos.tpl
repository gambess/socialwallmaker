{if ($router->activeRouteName() == 'recargar' || $router->activeRouteName() == 'enviar_obtenidos') || ($contPublicados eq 0 && $router->activeRouteName() != 'buscar' && $router->activeRouteName() != 'desbanear' && $router->activeRouteName() != 'deseliminar')}
    <div class="tab-pane fade active in" id="_obtenidos">
{else}
    <div class="tab-pane fade" id="_obtenidos">
{/if}    
    <div class="tabbable">
        <div class="dev_buttons-container">
            <input type="button" name="boton_crear" class="boton_actualizar btn btn-success" data-form="formulario-completo" value="{$smarty.const.BTN_GENERATE}" />
            <input type="button" name="select_all" data-form="formulario-completo" checked="" class="btn btn-primary select-all-tables pull-right" value="{$smarty.const.BTN_SELECT_ALL}" />
            <input type="button" name="boton_refresco" class="boton_recargar btn btn-warning pull-right" value="{$smarty.const.BTN_RELOAD}" data-href="{$router->path('recargar', ['hashtag' => $smarty.const.MI_PORTAL])}" />
            <div class="dev_ayuda_tooltip" data-toggle="tooltip" data-placement="left" title="{$smarty.const.AYUDA_OBTENIDOS}">
                <img src="/templates/img/indice.jpg"/>
            </div>
        </div>
        <ul class="nav nav-tabs">
            <!--Adicionamos los nombres de los tab : Twitter Instagram facebook etc-->
            {foreach from=$nuevos->datos key=key item=nuevo}
                <li class="{$nuevos->defaultActiveTab->$key}">
                    <a href="#_obtenidos_{$key}">{$key|Upper} ({$nuevos->estadistica->$key})</a>
                </li>
            {/foreach}
        </ul>
        <!--los tpl de los servicios existentes : Twitter.tpl Instagram.tpl facebook.tpl etc-->
        <form id="formulario-completo" method="post" action="{$router->path('generar', ['hashtag' => $smarty.const.MI_PORTAL])}">
            <div class="tab-content">
                {foreach from=$nuevos->datos key=key item=item}
                    {include file='includes/'|cat:$key|cat:'.tpl' info=$item tab={'_obtenidos_'|cat:$key} active=$nuevos->defaultActiveTab->$key}
                {/foreach}
            </div>
        </form>
    </div>
</div>

