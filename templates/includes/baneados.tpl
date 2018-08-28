{if $router->activeRouteName() == 'desbanear' || $router->activeRouteName() == 'deseliminar' }
    <div class="tab-pane fade active in" id="_baneados">
    {else}
        <div class="tab-pane fade" id="_baneados">
        {/if}
        <div class="tabbable">
            <ul class="nav nav-tabs">
                <!--Adicionamos los nombres de los tab : Twitter Instagram-->
                {assign var=contBaneados value=$baneados->estadistica->twitter + $baneados->estadistica->instagram}
                {assign var=contEliminados value=$eliminados->estadistica->twitter + $eliminados->estadistica->instagram}
                <li {if (($contBaneados eq 0 && $contEliminados eq 0 || $contBaneados neq 0) && $router->activeRouteName() != 'deseliminar') || $router->activeRouteName() == 'desbanear'}class="active"{/if}>
                    <a href="#_baneados_all">{$smarty.const.TAB_BANEADOS} ({$baneados->estadistica->twitter + $baneados->estadistica->instagram})</a>
                </li>
                <li {if (($contBaneados eq 0 && $contEliminados neq 0) && $router->activeRouteName() != 'desbanear' || $router->activeRouteName() == 'deseliminar')}class="active"{/if}>
                    <a href="#_eliminados_all">{$smarty.const.TAB_ELIMINADOS} ({$eliminados->estadistica->twitter + $eliminados->estadistica->instagram})</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade {if (($contBaneados eq 0 && $contEliminados eq 0 || $contBaneados neq 0) && $router->activeRouteName() != 'deseliminar') || $router->activeRouteName() == 'desbanear'}active in{/if}" id="_baneados_all">
                    <div class="dev_buttons-container">
                        <input type="button" name="boton_crear" class="btn btn-success pull-right boton_actualizar" value="{$smarty.const.BTN_DESBANEAR}" data-form="formulario-desbanear" />
                        <input type="button" name="select_all" data-form="formulario-desbanear" checked="" class="btn btn-primary select-all-tables pull-right" value="{$smarty.const.BTN_SELECT_ALL}" />
                        <div class="dev_ayuda_tooltip" data-toggle="tooltip" data-placement="left" title="{$smarty.const.AYUDA_BANEADOS}">
                            <img src="/templates/img/indice.jpg"/>
                        </div>
                    </div>
                    <form id="formulario-desbanear" method="post" action="{$router->path('desbanear', ['hashtag' => $smarty.const.MI_PORTAL])}">
                        <table class="table table-condensed table-hover datatable display">
                            <thead>
                                <tr>
                                    <th>{$smarty.const.TITLE_USER}</th>
                                    <th></th>
                                    <th>{$smarty.const.TITLE_UNDO}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foreach from=$baneados->datos item=e key=key}
                                <td class="user">
                                    <img src="{$e->UserImg}" width="{$e->UserImgWidth}" />
                                </td>
                                <td>
                                    <a href="{$e->UserNameLink}" target="_blank">{$e->UserFullName}</a>
                                </td>
                                <td class="checkall"><input type="checkbox" class="" name="deshacer_baneado[]" value="{$key}" /></td>
                                </tr>
                            {/foreach}
                            </tbody>
                        </table>
                    </form>
                </div>
                <div class="tab-pane fade {if (($contBaneados eq 0 && $contEliminados neq 0) && $router->activeRouteName() != 'desbanear' || $router->activeRouteName() == 'deseliminar')}active in{/if}" id="_eliminados_all">
                    <div class="dev_buttons-container">
                        <input type="button" name="boton_crear" class="btn btn-success pull-right boton_actualizar" value="{$smarty.const.BTN_DESELIMINAR}" data-form="formulario-deseliminar" />
                        <input type="button" name="select_all" data-form="formulario-deseliminar" checked="" class="btn btn-primary select-all-tables pull-right" value="{$smarty.const.BTN_SELECT_ALL}" />
                        <div class="dev_ayuda_tooltip" data-toggle="tooltip" data-placement="left" title="{$smarty.const.AYUDA_ELIMINADOS}">
                            <img src="/templates/img/indice.jpg"/>
                        </div>
                    </div>
                    <form id="formulario-deseliminar" method="post" action="{$router->path('deseliminar', ['hashtag' => $smarty.const.MI_PORTAL])}">
                        <table class="table table-condensed table-hover datatable display">
                            <thead>
                                <tr>
                                    <th>{$smarty.const.TITLE_USER}</th>
                                    <th>{$smarty.const.TITLE_DATA}</th>
                                    <th>{$smarty.const.TITLE_UNDO}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foreach from=$eliminados->datos item=e key=key}
                                <td class="user">
                                    <img src="{$e->UserImg}" width="{$e->UserImgWidth}" />
                                    <br/>
                                    <a href="{$e->UserNameLink}" target="_blank">{$e->UserFullName}</a>
                                </td>
                                <td>
                                    {if $e->Thumbnail}
                                        <img src="{$e->Thumbnail}" align="left"/>
                                    {/if}
                                    {$e->Html}
                                    {if $e->ImageUrl}
                                        <p><img src="{$e->ImageUrl}" width="{$e->ImageSizeWidth}" height="{$e->ImageSizeHeight}" /></p>
                                        {elseif $e->ImageExpandedUrl}
                                        <p><img src="{$e->ImageExpandedUrl}" width="{$e->ImageExpandedUrlWidth}" /></p>
                                        {/if}
                                    <p class="fecha">
                                        <a href="{$e->Link}" target="_blank">
                                            {$e->CreatedTime|date_format:"%d-%m-%Y %H:%M"}
                                        </a>
                                    </p>
                                </td>
                                <td class="checkall"><input type="checkbox" class="" name="deshacer_eliminado[]" value="{$key}" /></td>
                                </tr>
                            {/foreach}
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    </div>
