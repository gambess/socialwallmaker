<div class="tab-pane fade {$active}" id="{$tab}">
    <table class="table table-condensed table-hover datatable display">
        <thead>
            <tr>
                <th>{$smarty.const.TITLE_USER}</th>
                <th>{$smarty.const.TITLE_DATA_INSTAGRAM}</th>
                {if $tab eq '_publicados_instagram'}
                <th>{$smarty.const.TITLE_ELIMINAR}</th>
                {/if}
                {if $tab eq '_buscador_instagram'}
                <th>{$smarty.const.TITLE_AGREGAR}</th>
                {/if}
                {if $tab eq '_obtenidos_instagram'}
                <th>{$smarty.const.TITLE_PUBLICAR}</th>
                <!--<th>{*$smarty.const.TITLE_BANEAR*}</th>-->
                <th>{$smarty.const.TITLE_DELETE}</th>
                {/if}
            </tr>
        </thead>
        <tbody>
            {foreach from=$info item=e key=key}
                <tr class="warning">
                    <td class="user">
                        {if isset($e->UserImg) && $e->UserImg !== false}
                            <img src="{$e->UserImg}" width="{$e->UserImgWidth}"/><br/>
                        {/if}
                        {if isset($e->UserNameLink) && $e->UserNameLink !== false}
                        <a href="{$e->UserNameLink}" target="_blank">{$e->UserFullName}</a>
                        {/if}
                    </td>
                    <td>
                        {if isset($e->Thumbnail) && $e->Thumbnail !== false}
                            <img src="{$e->Thumbnail}" width="{$e->ImageSizeWidth}" align="left"/>
                        {/if}
                        {if isset($e->Html) && $e->Html !== false}
                            <p style="margin-left: 157px;">{$e->Html}</p>
                        {/if}
                        
                        {if isset($e->Link) && $e->Link !== false && isset($e->CreatedTime) && $e->CreatedTime !== false }
                            <p class="fecha">
                                <a href="{$e->Link}" target="_blank">
                                    {$e->CreatedTime|date_format:"%d-%m-%Y %H:%M"}
                                </a>
                            </p>
                        {/if}
                    </td>
                    {if $tab eq '_obtenidos_instagram'}
                        <td class="check checkall">
                            <input type="checkbox" class="input check-option" data-order="1" name="option[]" value="{$key}" />
                        </td>
                        <!--<td class="checkoption">
                            <input type="checkbox" class="input-baner check-option" data-order="2" name="banear[]" value="{*$key*}" />
                        </td>-->
                        <td class="checkoption">
                            <input type="checkbox" class="input-delete check-option" data-order="3" name="eliminar[]" value="{$key}" />
                        </td>
                    {elseif $tab eq '_publicados_instagram'}
                        <td class="check checkall">
                            <input type="checkbox" class="input" name="option-delete[]" value="{$key}" />
                        </td>
                    {elseif $tab eq '_buscador_instagram'}
                        <td class="check checkall">
                            <input type="checkbox" class="input" name="search[]" value="{$key}" />
                        </td>
                    {/if}
                </tr>
            {/foreach}                                            
        </tbody>
    </table>
</div>