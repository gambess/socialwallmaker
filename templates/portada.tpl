<!-- === inicio de {$smarty.template} === -->
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head> 
        <meta http-equiv="content-type" content="text/html;charset=utf-8" >
            <title>{$smarty.const.MI_PORTAL}</title>
            {include file='includes/assets_css.tpl'}
    </head>
    <body>
        <div id="contenedor">
            <div id="fijo">
                <div class="cabecera">
                    <div class="cce_cabecera">
                        <div style="float: left;" class="cce_titulo">
                            <a border="0" href="{$router->path('portada', ['hashtag' => $smarty.const.MI_PORTAL])}">
                                <img style="height: 18px;width: auto;" src="/editor/iconos/v2.x/v2.0/elpais.png" class="cce_logo_elpais" alt="logo WallMaker">
                                    <span style="color: #AAAAAA;display: inline-block;font: normal 12px Arial,Helvetica,sans-serif;margin-left: 3px;margin-top: 6px;" class="editores">
                                        {$title_editor|upper}
                                    </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="contenido_principal">
                {*assign var="services" value=","|explode:"twitter,instagram"*}
                <div class="tabbable boxed parentTabs">
                    <ul class="nav nav-tabs">
                        {include file='includes/tab_principal.tpl'}
                    </ul>
                    <div class="tab-content">
                        {include file='includes/publicados.tpl'}
                        {include file='includes/obtenidos.tpl'}
                        {include file='includes/baneados.tpl'}
                        {include file='includes/buscador.tpl'}
                    </div>
                </div>
            </div> 
        </div>
        {include file='includes/contenido_modal_espera.tpl'}
        {include file='includes/notificaciones.tpl'}
        {include file='includes/assets_js.tpl'}
    </body>
</html>
<!-- === fin de {$smarty.template} === -->

