{if ($router->activeRouteName() == 'portada' || $router->activeRouteName() == 'generar' || $router->activeRouteName() == 'borrar') && $contPublicados neq 0}
    <div class="tab-pane fade active in" id="_publicados">
{else}
    <div class="tab-pane fade" id="_publicados">
    {/if}
    <div class="tabbable">
        <div class="dev_buttons-container">
            <input type="button" name="boton_crear" class="btn btn-primary boton_actualizar pull-right" data-form="formulario-borrar" value="{$smarty.const.BTN_DELETE_PUBLISHED}" />
            <input type="button" name="select_all" data-form="formulario-borrar" checked="" class="btn btn-success select-all-tables pull-right" value="{$smarty.const.BTN_SELECT_ALL}" />        
            <div class="dev_ayuda_tooltip" data-toggle="tooltip" data-placement="left" title="{$smarty.const.AYUDA_PUBLICADOS}">
                <img src="/templates/img/indice.jpg"/>
            </div>
        </div>
        <ul class="nav nav-tabs">
            <!--Adicionamos los nombres de los tab : Twitter Instagram facebook etc-->
            {foreach from=$usados->datos key=key item=nuevo}
                <li class="{$usados->defaultActiveTab->$key}">
                    <a href="#_publicados_{$key}">{$key|Upper} ({$usados->estadistica->$key})</a>
                </li>
            {/foreach}
        </ul>
        <!--los tpl de los servicios existentes : Twitter.tpl Instagram.tpl facebook.tpl etc-->
        <form id="formulario-borrar" method="post" action="{$router->path('borrar', ['hashtag' => $smarty.const.MI_PORTAL])}">
            <div class="tab-content">
                {foreach from=$usados->datos key=key item=item}
                    {include file='includes/'|cat:$key|cat:'.tpl' info=$item tab={'_publicados_'|cat:$key} active=$usados->defaultActiveTab->$key}
                {/foreach}
            </div>
        </form>
    </div>
</div>
