{foreach $datos->datos as $key => $item }
    {if $item->ImageUrl != false ||  $item->ImagesLowResolution || $item->ImageExpandedUrl != false }
        <div class="grid-item grid-item--width2">
    {else}
        <div class="grid-item">
    {/if}
        <div class="mod-img">
            <a class="account-group estirar" href="{$item->UserNameLink}" target="_blank">
                <img class="avatar js-action-profile-avatar" src="{$item->UserImg}" alt="">
            </a>
        </div>
        <div class="mod-txt">
            <a class="fullname account-group " href="{$item->UserNameLink}" target="_blank">
                {$item->UserFullName}
            </a>
            <a class="username account-group" href="{$item->UserNameLink}" target="_blank">
                @{$item->UserName}
            </a>

            <div class="tweet-text">
                {if $item->ImagesLowResolution != false}
                    <img class="a1" src="{$item->ImagesLowResolution}"/>
                {/if}
                <p>{$item->Html}</p>
                {if $item->ImageUrl != false}
                    <img class="a2" src="{$item->ImageUrl}" width="{$item->ImageSizeWidth}" height="{$item->ImageSizeHeight}" />
                {elseif  $item->ImageExpandedUrl != false}
                    {* El parámetro ImageExpandedUrl no devuelve en ningún caso la ruta de la imagen. desactivamos esta opción. *}
{*                    <p><img class="a3" src="{$item->ImageExpandedUrl}" /></p>*}
                {/if}
            </div>
            <p class="fecha">
                <a href="{$item->Link}" target="_blank">
                    {$item->CreatedTime|date_format:"%d-%m-%Y %H:%M"}
                </a>
            </p>
        </div>
    </div>
{/foreach}