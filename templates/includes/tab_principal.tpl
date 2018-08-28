{assign var="contPublicados" value=0 scope="global"}
{foreach from=$usados->estadistica key=key item=item}
    {assign var="contPublicados" value=$contPublicados + $item scope="global"}
{/foreach}
{assign var="contObtenidos" value=0}
{foreach from=$nuevos->estadistica key=key item=item}
    {assign var="contObtenidos" value=$contObtenidos + $item}
{/foreach}
{assign var="contBaneados" value=0}
{foreach from=$baneados->estadistica key=key item=item}
    {assign var="contBaneados" value=$contBaneados + $item}
{/foreach}
{assign var="contEliminados" value=0}
{foreach from=$eliminados->estadistica key=key item=item}
    {assign var="contEliminados" value=$contEliminados + $item}
{/foreach}
{assign var="contBuscador" value=0}
{foreach from=$buscador->estadistica key=key item=item}
    {assign var="contBuscador" value=$contBuscador + $item}
{/foreach}

<li id="pub" {if ($router->activeRouteName() == 'portada' || $router->activeRouteName() == 'generar' || $router->activeRouteName() == 'borrar') && $contPublicados neq 0}class="active"{/if}>
    <a href="#_publicados">{$smarty.const.TAB_PUBLISHED} ({$contPublicados})</a>
</li>
<li id="obt" {if ($router->activeRouteName() == 'recargar' || $router->activeRouteName() == 'enviar_obtenidos') || ($contPublicados eq 0 && $router->activeRouteName() != 'buscar' && $router->activeRouteName() != 'desbanear' && $router->activeRouteName() != 'deseliminar')}class="active"{/if}>
    <a href="#_obtenidos">{$smarty.const.TAB_NEW} ({$contObtenidos})</a>
</li>
<li id="baneados" {if $router->activeRouteName() == 'desbanear' || $router->activeRouteName() == 'deseliminar' }class="active"{/if}>
    <a href="#_baneados">{$smarty.const.TAB_BANEADOS_ELIMINADOS} ({$contBaneados + $contEliminados})</a>
</li>
<li id="search_by_hashtag" {if $router->activeRouteName() == 'buscar' }class="active"{/if}>
    <a href="#_buscador">{$smarty.const.TAB_SEARCH} ({$contBuscador})</a>
</li>
