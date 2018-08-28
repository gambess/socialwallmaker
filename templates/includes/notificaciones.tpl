<div class="dev_notificaciones" {if count($estadisticas) > 0}data-show="true"{else}data-show="false"{/if}>
    {* Estadísticas enviar obtenidos del buscador *}
    {if $estadisticas.numeroElementosObtenidosTotal}
        <ul>
            {if $estadisticas.numeroElementosAnadidos}
                <li>{$smarty.const.MODAL_TOTAL_ANADIDOS_BUSCADOR} {$estadisticas.numeroElementosAnadidos}.</li>
            {/if}
            {if $estadisticas.numeroElementosExistentes}
                <li>{$smarty.const.MODAL_TOTAL_NO_ANADIDOS_BUSCADOR} {$estadisticas.numeroElementosExistentes}.</li>
            {/if}
        </ul>
        <p><strong>{$smarty.const.MODAL_EXISTE_UN_TOTAL} {$estadisticas.numeroElementosObtenidosTotal} {$smarty.const.MODAL_OBTENIDOS_REDES}</strong></p>
    {/if}

    {* Estadísticas publicar registros en el muro *}
    {if $estadisticas.publicarNumeroElementosNuevos > 0 || $estadisticas.publicarNumeroElementosBaneados || $estadisticas.publicarNumeroElementosEliminados }
        <ul>
            {if $estadisticas.publicarNumeroElementosNuevos}
                <li>{$smarty.const.MODAL_NUEVOS_PUBLICADOS_TOTAL} {$estadisticas.publicarNumeroElementosNuevos}.</li>
            {/if}
            {if $estadisticas.obtenidosNumeroElementosUsados}
                <li>{$smarty.const.MODAL_PUBLICADOS_TOTAL} {$estadisticas.obtenidosNumeroElementosUsados}.</li>
            {/if}
            {if $estadisticas.publicarNumeroElementosBaneados}
                <li>{$smarty.const.MODAL_BANEADOS_TOTAL} {$estadisticas.publicarNumeroElementosBaneados}.</li>
            {/if}
            {if $estadisticas.publicarNumeroElementosEliminados}
                <li>{$smarty.const.MODAL_ELIMINADOS_TOTAL} {$estadisticas.publicarNumeroElementosEliminados}.</li>
            {/if}
        </ul>
        <p><strong>{$smarty.const.MODAL_EXISTE_UN_TOTAL} {$estadisticas.publicarNumeroElementosTotal} {$smarty.const.MODAL_REGISTROS_PUBLICADOS} {$smarty.const.MODAL_OBTENIDOS_REDES}</strong></p>
    {else if $estadisticas.publicarNumeroElementosUsados > 0}
        <p>{$smarty.const.MODAL_NO_PUBLICADO}</p>
        <p><strong>{$smarty.const.MODAL_EXISTE_UN_TOTAL} {$estadisticas.publicarNumeroElementosUsados} {$smarty.const.MODAL_REGISTROS_PUBLICADOS}.</strong></p>
    {/if}

    {* Estadísticas borrar registros *}
    {if $estadisticas.borrarNumeroElementosBorrar > 0 }
        <ul>
            {if $estadisticas.borrarNumeroElementosBorrar}
                <li>{$smarty.const.MODAL_ELIMINADOS_TOTAL} {$estadisticas.borrarNumeroElementosBorrar}.</li>
            {/if}
        </ul>
        <p><strong>{$smarty.const.MODAL_EXISTE_UN_TOTAL} {$estadisticas.borrarNumeroElementosTotal} {$smarty.const.MODAL_REGISTROS_PUBLICADOS}.</strong></p>
    {else if $estadisticas.borrarNumeroElementosTotal }
        <ul>
            <li>{$smarty.const.MODAL_NO_ELIMINADO}</li>
        </ul>
        <p><strong>{$smarty.const.MODAL_EXISTE_UN_TOTAL} {$estadisticas.borrarNumeroElementosTotal} {$smarty.const.MODAL_REGISTROS_PUBLICADOS}.</strong></p>
    {/if}
    
    {* Estadísticas recuperardos (baneados/eliminados) *}
    {if $estadisticas.recuperadosNumeroElementosRecuperados > 0 }
        <p><strong>{$smarty.const.MODAL_RECUPERADOS} {$estadisticas.recuperadosNumeroElementosRecuperados} {$smarty.const.MODAL_RECUPERADOS_DE_UN_TOTAL} {$estadisticas.recuperadosNumeroElementosTotal}.</strong></p>
    {/if}
</div>