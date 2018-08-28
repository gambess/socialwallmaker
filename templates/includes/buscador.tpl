{if $router->activeRouteName() == 'buscar' }
    <div class="tab-pane fade active in" id="_buscador">
{else}
    <div class="tab-pane fade" id="_buscador">
{/if}
    <div class="dev_buttons-container">
        <input type="button" name="boton_crear" class="boton_actualizar btn btn-success" data-form="formulario-buscador" value="{$smarty.const.BTN_ADD_OBTENIDOS}" />
        <input type="button" name="select_all" data-form="formulario-buscador" checked="" class="btn btn-primary select-all-tables pull-right" value="{$smarty.const.BTN_SELECT_ALL}" />
    </div>
    <form id="buscador" method="post" action="{$router->path('buscar', ['hashtag' => $smarty.const.MI_PORTAL])}">
        <div class="pull-right">
            <div class="dev_clear-input">
                <input type="search" name="buscar" value="{if isset($buscador->searchInput)}{$buscador->searchInput}{/if}" placeholder="{$smarty.const.INPUT_SEARCH_PLACEHOLDER}" style="margin: 0px;">
                <span class="clear">X</span>
            </div>
            <button type="submit" class="btn btn-primary boton_buscar">{$smarty.const.BTN_SEARCH}</button>
        </div>
    </form>
    <div class="dev_ayuda_tooltip" data-toggle="tooltip" data-placement="left" title="{$smarty.const.AYUDA_BUSCADOR}">
        <img src="/templates/img/indice.jpg"/>
    </div>
    <div class="tabbable">
        <ul class="nav nav-tabs">
            <!--Adicionamos los nombres de los tab : Twitter Instagram-->
            {foreach from=$buscador->datos key=key item=nuevo}
                <li class="{$buscador->defaultActiveTab->$key}">
                    <a href="#_buscador_{$key}">{$key|Upper} ({$buscador->estadistica->$key})</a>
                </li>
            {/foreach}
        </ul>
        <!--los tpl de los servicios existentes -->
        <form id="formulario-buscador" method="post" action="{$router->path('enviar_obtenidos', ['hashtag' => $smarty.const.MI_PORTAL])}">
            <div class="tab-content">
                {foreach from=$buscador->datos key=key item=item}
                    {include file='includes/'|cat:$key|cat:'.tpl' info=$item tab={'_buscador_'|cat:$key} active=$buscador->defaultActiveTab->$key}
                {/foreach}
            </div>
        </form>
    </div>
</div>
