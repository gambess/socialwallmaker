{foreach $datos as $key => $item }
    {if isset($item->ImageUrl)}
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
            <a class="username account-group" href="{$item->UserNameLink}w" target="_blank">
                @{$item->UserName}
            </a>

            <div class="tweet-text">
                {if $item->ImagesLowResolution}
                    <img src="{$item->ImagesLowResolution}"/>
                {/if}
                <p>{$item->Html}</p>
                {if isset($e->ImageUrl)}
                    <img src="{$item->ImageUrl}" width="{$item->ImageSizeWidth}" height="{$item->ImageSizeHeight}" />
                {elseif isset($item->ImageExpandedUrl)}
                    <p><img src="{$item->ImageExpandedUrl}" /></p>
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