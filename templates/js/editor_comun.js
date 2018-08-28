// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
// editor_comun.js
// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
// modificaciones:
// --------------------------------------------------------------------------------------------------------------------
// 		20110526 (Juanje)
//		- Se añade la limpieza de strong y em vacíos mediante expresiones regulares
//		  en la función textoCambiadoTinyMCE
//
// 		20110620 (Juanje)
//		- Se añaden las funciones necesarias que actualiza el sistema de notificaciones
//        para mostrar las advertencias de usuarios simultáneos en noticias y portadillas
//      - Se añade un nuevo objeto con nuevas opciones de TinyMCE para que el p no sea
//	      obligatorio en sus campos
//
// 		20110210 (Juanje)
//		- Activado sistema acumulable de notificaciones en noticia. Cuando el usuario se va, desaparece del mensaje
//
// 		20110312 (Juanje)
//		- Añadido body de editor visual de bloques a la lista blanca de estilos
//
// 		20120518 (Juanje)
//		- Protegido en anadeInterrogacion si no existe el campo al que se le quiere activar la ayuda
//		- Protegido en activaTinyMCE si no existe seccion_sumarios para el caso de editor de entrada de albumes
//
// 		20130924 (Juanje)
//		- Añadida posibilidad de ocultar las notificaciones inferiores
//
// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------



// TinyMCE, el editor WYIWYG

if (typeof tinyMCE != "undefined") {

    var tinymce_config_por_defecto = [{
            // Opciones generales
            mode: "exact",
            elements: "",
            theme: "advanced",
            content_css: "/editor/estilos/v2.x/v2.0/textareas_html.css",
            language: "es",
            plugins: "style,layer,table,advhr,advlink,iespell,inlinepopups,media,advlist,paste,fullscreen,spellcheck",
            // Opciones del tema
            theme_advanced_buttons1: "bold,italic,formatselect,link,unlink,|,bullist,numlist,|,blockquote,|,pasteword,pastetext,cleanup,|,anchor,|,undo,redo,|,hr,|,sub,sup,|,charmap,|,code,|,spellcheck",
            theme_advanced_buttons2: "tablecontrols,|,styleselect,|,fullscreen",
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_statusbar_location: "bottom",
            theme_advanced_resizing: true,
            theme_advanced_blockformats: "h3,h4,p",
            table_styles: "Compacta=compacta;Muy compacta=muy_compacta",
            table_cell_styles: "Pie=pie;Rojo=rojo;Verde=verde;Azul=azul;(\u2191) Sube=sube_con_bolillo;(\u003d) Se mantiene=se_mantiene_con_bolillo;(\u2193) Baja=baja_con_bolillo",
            table_row_styles: "Fila resaltada=destacada",
            object_resizing: false,
            onchange_callback: "textoCambiadoTinyMCE",
            init_instance_callback: "procesaInstanciaTinyMCE",
            invalid_elements: "script,font,small,div,dd,dl,big,tt,pre,code",
            theme_advanced_resize_horizontal: false,
            theme_advanced_source_editor_width: 670,
            entity_encoding: "raw",
            gecko_spellcheck: true,
            convert_urls: false,
            style_formats: [
                {title: 'Autor cita', block: 'p', attributes: {'class': 'autor_cita'}},
                {title: 'Texto grande', block: 'p', attributes: {'class': 'texto_grande'}},
                {title: 'Pie vídeo', block: 'p', attributes: {'class': 'pie_video'}},
                {title: 'Subir (Anclas)', block: 'p', attributes: {'class': 'subir'}},
                {title: 'Nota al pie', block: 'p', attributes: {'class': 'nota_pie'}},
                {title: 'Audio Cadena Ser', selector: 'a', classes: 'audio_cadenaser'}
            ]
        }];

    tinyMCE.settings = tinymce_config_por_defecto[0];

    // opciones para sumarios, permitimos cualquier tag html
    var tinymce_config_sumario_html = clonaObjeto(tinymce_config_por_defecto);
    // sobreescribimos estas propiedades para permitir todo en los sumarios
    tinymce_config_sumario_html[0].invalid_elements = "";
    tinymce_config_sumario_html[0].forced_root_block = "p";
    tinymce_config_sumario_html[0].valid_elements = "*[*]";
    tinymce_config_sumario_html[0].extended_valid_elements = "*[*]";
    tinymce_config_sumario_html[0].valid_children = "+body[style]";


    // opciones para encuestas, no forzamos el P
    var tinymce_config_encuestas = clonaObjeto(tinymce_config_por_defecto);
    tinymce_config_encuestas[0].forced_root_block = false;
    tinymce_config_encuestas[0].invalid_elements = "br,p";


}


var EDITOR_COMUN = {};
EDITOR_COMUN.ed_salida_seccion_anterior = "";
EDITOR_COMUN.errores_tecnicos = [];


function clonaObjeto(obj) {
    if (obj == null || typeof (obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for (var key in obj)
        temp[key] = clonaObjeto(obj[key]);
    return temp;
}



function debug(texto) {
    try {
        console.log(texto);
    } catch (e) {
        // no lo soporta el navegador, no hacer nada
    }
}

function activaTinyMCE() { // activamos TinyMCE en todos los cuadros relevantes
    var i;
    var j;

    // en el cuerpo de texto, ponemos las opciones por defecto, no permitimos tags peligrosos, como div o script
    tinyMCE.settings = tinymce_config_por_defecto[0];

    if (document.getElementById("id_campo_formulario_cuerpo"))
        tinyMCE.execCommand('mceAddControl', false, "id_campo_formulario_cuerpo");

    if (document.getElementById("id_campo_formulario_fedeerrores"))
        tinyMCE.execCommand('mceAddControl', false, "id_campo_formulario_fedeerrores");

    if (document.getElementById("seccion_sumarios")) {
        var seccion_sumarios = document.getElementById("seccion_sumarios");

        var sumarios = seccion_sumarios.getElementsByTagName("div");
        var selects;
        for (i = 0; i < sumarios.length; i++) {


            if (((sumarios[i].id.substr(0, 8) == "sumario_") && (obtieneEstiloComputado(sumarios[i], "display") == "block"))) {
                // es un sumario, vamos a ver si tiene algún textarea

                activaTinyMCESumario(sumarios[i]);

            }
            selects = sumarios[i].getElementsByTagName("select");

            for (j = 0; j < selects.length; j++) {

                if ((selects[j].id.indexOf("_modelo_sumario") != -1) || (selects[j].id.indexOf("_alineacion") != -1))
                    var que_sumario = sumarios[i];
                try { //For IE
                    selects[j].attachEvent("onchange", function (que_sumario) {
                        return function () {
                            activaTinyMCESumario(que_sumario)
                        }
                    }(que_sumario));
                } catch (e) { //For FF, Opera, Safari etc
                    selects[j].addEventListener("change", function (que_sumario) {
                        return function () {
                            activaTinyMCESumario(que_sumario)
                        }
                    }(que_sumario), false);
                }
            }

        }
    }

}


function obtieneInstanciaTinyMCE(id_textarea) {
    var instancia;
    for (edId in tinymce.editors) {
        if (tinymce.editors[edId].editorId == id_textarea) {
            instancia = tinymce.editors[edId];
            return(instancia);
        }
    }

}


function activaTinyMCESumario(sumario) {

    var divs = sumario.getElementsByTagName("div");
    var parrafos = sumario.getElementsByTagName("p");
    procesaElementos(divs);
    procesaElementos(parrafos);

    function procesaElementos(elementos) {

        var i;
        var j;
        var k;
        var ya_creado = new Array();
        for (i = 0; i < elementos.length; i++) {

            if ((elementos[i].id != "") && (obtieneEstiloComputado(elementos[i], "display") == "block")) {
                var textareas = elementos[i].getElementsByTagName("textarea");
                for (j = 0; j < textareas.length; j++) {
                    if ((textareas[j].id).indexOf("_contenido_html") != -1) {

                        // si no existe el elemento con _parent añadido al final, es que no está creado el cuadro tinyMCE
                        if (!document.getElementById(textareas[j].id + "_parent")) {

                            var encontrado = false;
                            for (k = 0; k < ya_creado.length; k++) {
                                if (textareas[j].id == ya_creado[k]) {
                                    encontrado = true;
                                }
                            }

                            if (!encontrado) {
                                // cambiamos las opciones de tinymce para permitir todos los tags posibles
                                tinyMCE.settings = tinymce_config_sumario_html[0];
                                tinyMCE.execCommand('mceAddControl', false, textareas[j].id);
                                tinyMCE.settings = tinymce_config_por_defecto[0];

                            }

                            ya_creado.push(textareas[j].id);

                        } else // si ya existía, miramos la alineación y el modelo
                        {
                            var datos_sumario = obtieneTipoAlineacionSumario(sumario);

                            var instancia = tinyMCE.get(textareas[j].id);
                            ponClassHTMLSumario(instancia, datos_sumario.modelo, datos_sumario.alineacion);
                        }

                    }

                }
            }
        }

    }
}

function obtieneTipoAlineacionSumario(sumario) {
    var datos = {modelo: "", alineacion: ""};
    var selects = sumario.getElementsByTagName("select");
    var clase = "sumario";
    for (k = 0; k < selects.length; k++) {

        if (selects[k].id.indexOf("_modelo_sumario") != -1)
            datos.modelo = selects[k].value;
        if (selects[k].id.indexOf("_alineacion") != -1)
            datos.alineacion = selects[k].value;
    }
    return(datos);
}

function ponClassHTMLSumario(instancia, modelo, alineacion) {
    instancia.getBody().className = modelo + " " + alineacion + " " + modelo + "_" + alineacion;
}

function procesaInstanciaTinyMCE(instancia) { // función que se llama cada vez que se crea una nueva instancia del tinymce
    var i, j, k;
    vigilaFocusBlurTinyMCE(instancia);

    var id = instancia.id;

    // tenemos que poner class específicos a los body de los tinymce para
    // que salgan bien los estilos de la noticia para los blockquotes y demás

    if (id == "id_campo_formulario_cuerpo") {
        instancia.getBody().className = "cuerpo";
        return;
    }

    if (id.indexOf("id_campo_formulario_sumarios") != -1) {

        var trozos = id.split("_");
        for (i = 0; i < trozos.length; i++) {
            if ((trozos[i] != "sumarios") && (trozos[i].indexOf("sumario") != -1)) {

                trozos[i] = trozos[i].replace("sumario", "sumario_");

                if (document.getElementById(trozos[i]))
                {
                    var sumario = document.getElementById(trozos[i]);

                    var datos_sumario = obtieneTipoAlineacionSumario(sumario);
                    ponClassHTMLSumario(instancia, datos_sumario.modelo, datos_sumario.alineacion);
                }
            }
        }

    }


    function vigilaFocusBlurTinyMCE(inst) { // para poner el marco azul cuando está activo
        var s = inst.settings;
        var realID = inst.id + '_tbl';
        var text_area = document.getElementById(realID);
        tinymce.dom.Event.add(inst.getWin(), 'focus', function (e) {
            text_area.className += " cuadro_texto_activo";

        });
        tinymce.dom.Event.add(inst.getWin(), 'blur', function (e) {
            var clase = text_area.className;
            clase = clase.replace(/cuadro_texto_activo/i, "");
            text_area.className = clase;
        });
    }


}


function textoCambiadoTinyMCE(inst) { // quita los tags "ilegales" del cuadro del tinymce

    var invalidTagsRegExp = new RegExp("<(" + inst.settings.invalid_elements.replace(",", "|").toLowerCase() + ")");
    var html = inst.getBody().innerHTML;

    if (invalidTagsRegExp.test(html)) {
        inst.execCommand('mceCleanup', false, '');
    }

    // quitamos los tags de strong y em vacíos
    limpia("<strong>([ ]*)</strong>", "$1");	 // por algún motivo desconocido, poniendo \s en lugar de [ ]  no funciona
    limpia("<em>([ ]*)</em>", "$1");
    limpia("\uFEFF", ""); // para quitar el non breaking space de UTF-16 (estropea el pegado de HTML en IE)

    function limpia(exp, sustitucion) {
        var expresion = new RegExp(exp);
        if (expresion.test(html)) {
            inst.getBody().innerHTML = html.replace(expresion, sustitucion);
        }
    }

}



// fin TinyMCE, el editor WYIWYG


function scrollHecho() {

    scroll_realizado = true;

    var i;
    var scrollTop = document.body.scrollTop;
    var y_ini, y_fin;

    if (scrollTop == 0) {
        if (window.pageYOffset)
            scrollTop = window.pageYOffset;
        else
            scrollTop = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
    }

    if (document.getElementById("fijo"))
        scrollTop += document.getElementById("fijo").offsetHeight;

    var formulario = document.getElementById("formulario");
    var fieldsets = formulario.getElementsByTagName("fieldset");
    for (i = 0; i < fieldsets.length; i++) {

        y_ini = fieldsets[i].offsetTop;

        y_fin = y_ini + fieldsets[i].offsetHeight;

        if ((scrollTop > y_ini) && (scrollTop < y_fin)) {

            var clase = fieldsets[i].id;
            reseteaMenuPrincipal("menu_" + clase);


            if (document.getElementById("menu_" + clase) && (document.getElementById("menu_" + clase).className.indexOf("activo") == -1)) {
                EDITOR_COMUN.ed_salida_seccion_anterior = "";

                document.getElementById("menu_" + clase).className = "activo";
            }


        }

    }


}

function reseteaMenuPrincipal(cual_no) {
    if (!cual_no)
        cual_no = "";
    var menu_principal = document.getElementById("menu_principal");
    var hijos = menu_principal.getElementsByTagName("li");
    for (i = 0; i < hijos.length; i++) {

        if (hijos[i].id != cual_no) {
            var clase = hijos[i].className;
            clase = clase.replace(/activo/gi, "");
            hijos[i].className = clase;
        }

    }
}

function compruebaSumario(sumario) {
    var i;

    for (i = 0; i < sumario.childNodes.length; i++) {
        if (sumario.childNodes[i].tagName == "INPUT") {
            if (sumario.childNodes[i].checked === true) {
                sumario.parentNode.className += " desactivado";
            } else
            {
                var clase = sumario.parentNode.className;
                clase = clase.replace(/ desactivado/gi, "");
                sumario.parentNode.className = clase;
            }
        }

    }
}

function irASeccion(cual) {

    if (EDITOR_COMUN.ed_salida_seccion_anterior == cual) { // detectamos el doble clic sobre algún menú

        // cuerpo noticia
        if (cual == "seccion_cuerpo_noticia") {
            veADiv("shortcut_cuerpo_texto_noticia");
            EDITOR_COMUN.ed_salida_seccion_anterior = "shortcut_cuerpo_texto_noticia";
            return;
        }


    }

    // clics consecutivos a sumarios
    if (cual.indexOf("sumario") != -1) {

        var pos1 = cual.indexOf("_");
        var cadena = cual;
        if (EDITOR_COMUN.ed_salida_seccion_anterior != "")
            cadena = EDITOR_COMUN.ed_salida_seccion_anterior;
        var sub = cadena.substr(pos1, cadena.length - pos1);


        if (!((cual == "seccion_sumarios") && (EDITOR_COMUN.ed_salida_seccion_anterior.indexOf("sumario") == -1))) {

            var actual;
            if (sub == "_sumarios") {
                actual = 1;
            } else
            {
                sub = sub.replace("_", "");
                actual = parseInt(sub);
            }
            cual = "sumario_" + (actual + 1);

            var display = obtieneEstiloComputado(document.getElementById(cual), "display");

            if (display != "none") { // el sumario está visible
                veADiv(cual);
                EDITOR_COMUN.ed_salida_seccion_anterior = cual;
                return;
            } else
            {
                cual = "seccion_sumarios";

            }

        }

    }


    if (document.getElementById(cual)) {
        reseteaMenuPrincipal();
        if (document.getElementById("menu_" + cual))
            document.getElementById("menu_" + cual).className = "activo"; // resaltamos la seccion en el menu superior
        veADiv(cual);
    }


    function veADiv(id) {

        var div = document.getElementById(id);
        var scrollTop = div.offsetTop;
        if (document.getElementById("fijo")) {
            var fijo = document.getElementById("fijo");
            window.scrollTo(0, scrollTop - fijo.offsetHeight);
        }

    }

    EDITOR_COMUN.ed_salida_seccion_anterior = cual;
}

function irACampo(cual) {
    var campo = document.getElementById(cual);
    var scrollTop = campo.offsetTop;

    campo.className += "resalta_campo_error ";
    campo.onfocus = function () {
        var that = this;
        var clase = that.className;
        clase = clase.replace(/resalta_campo_error/i, "");
        that.className = clase;
    }
    if (document.getElementById("fijo")) {
        var fijo = document.getElementById("fijo");
        window.scrollTo(0, scrollTop - fijo.offsetHeight);
    }

}

/* notificaciones */

function anadeNotificacionUsuariosEditando(hash_usuarios, donde) {
    
    if (typeof donde == "undefined")
        donde = "portadilla";

    if (hash_usuarios.length == 0) {
        quitaNotificacionAcumulable();
        return;
    }

    var i;
    var usuario = "";
    var email = "";
    var ip = "";
    var nombre = "";
    var nuevo = 0;
    var flash_nueva_inc = false;
    var html = "<ul>";

    for (i = 0; i < hash_usuarios.length; i++) {
        usuario = hash_usuarios[i].usuario;
        nombre = hash_usuarios[i].nombre;
        email = hash_usuarios[i].email;
        nuevo = hash_usuarios[i].nuevo;
        ip = hash_usuarios[i].ip;
        var li = "<li>";
        if (nuevo == 1) {
            li = "<li class='nueva_incorporacion'>";
            flash_nueva_inc = true;
        }
        if (hash_usuarios[i].foto == "")
            hash_usuarios[i].foto = "http://eskup.elpais.com/Iconos/v1.x/v1.0/varios/no_foto.jpg";
        html += li + "<div class='foto'><img width='30' height='30' src='" + hash_usuarios[i].foto + "'></div><div class='texto'><strong>" + email + "</strong>" + ' (' + usuario + ') <div class="detalles"><span class="email">' + nombre + '</span> <span class="ip">IP: ' + ip + '</span></div></div></li>';

    }
    html += "</ul><div style='clear:both'></div>";

    if (!document.getElementById("notificacion_acumulable"))
        flash_nueva_inc = true;

    if (donde == "portadilla") {
        anadeNotificacion({flash: false, acumulable: true, html: true, texto: html, titulo: "En esta portadilla »", tipo: "info", donde: donde});
    } else if (donde == "editorsocial") {
        anadeNotificacion({flash: flash_nueva_inc, acumulable: true, html: true, texto: html, titulo: "En este editor social »", tipo: "info", donde: donde});
    } else {
        anadeNotificacion({flash: flash_nueva_inc, acumulable: true, html: true, texto: html, titulo: "En esta noticia »", tipo: "advertencia", donde: donde});
    }

    if (EDITOR_COMUN.opciones.hasOwnProperty("notificaciones_visibles")) {
        if (EDITOR_COMUN.opciones.notificaciones_visibles == "0") {
            if (!notificaciones.className.match("escondido"))
                setTimeout(function () {
                    //esconderOcultarNotificaciones()
                }, 1000);
        }
    }
}
function quitaNotificacionAcumulable() {
    if (document.getElementById("notificacion_acumulable")) {
        var notificacion = document.getElementById("notificacion_acumulable");
        var notificaciones = notificacion.parentNode;
        notificaciones.removeChild(notificacion)
    }
}

function esconderOcultarNotificacionesAlto() {
    var notificaciones = document.getElementById("notificaciones");
    var alto = notificaciones.offsetHeight;
    notificaciones.style.bottom = "-" + (alto - 5) + "px";

}

function esconderOcultarNotificaciones() {

    if (!EDITOR_COMUN.opciones.hasOwnProperty("notificaciones_visibles")) {
        EDITOR_COMUN.opciones.notificaciones_visibles = 1;
    }
    var notificaciones = document.getElementById("notificaciones");

    if (notificaciones.className.match(" escondido")) {
        notificaciones.className = notificaciones.className.replace(" escondido", "");
        notificaciones.className += " mostrado";
        notificaciones.style.bottom = "0px";
        EDITOR_COMUN.opciones.notificaciones_visibles = 1;
    } else
    {
        notificaciones.className = notificaciones.className.replace(" mostrado", "");
        esconderOcultarNotificacionesAlto();
        notificaciones.className += " escondido";
        EDITOR_COMUN.opciones.notificaciones_visibles = 0;
    }

    guardaOpciones();

}
function anadeNotificacion(hash_notificacion) {
    

    var notificaciones;
    // si no existe el div contenedor de las notificaciones, lo creamos
    if (!document.getElementById("notificaciones")) {
        notificaciones = document.createElement("div");
        notificaciones.id = "notificaciones";
        if (hash_notificacion.acumulable == true) {
            var boton_esconder_mostrar = document.createElement("div");
            boton_esconder_mostrar.className = "boton_ocultar_mostrar";
            boton_esconder_mostrar.innerHTML = "x";
            notificaciones.appendChild(boton_esconder_mostrar);
            boton_esconder_mostrar.onclick = function () {
                esconderOcultarNotificaciones()
            }
        }
        console.log(notificaciones);
        document.body.appendChild(notificaciones);
    } else
    {
        notificaciones = document.getElementById("notificaciones");
    }


    var flash = true;
    var acumulable = false;
    var tipo = hash_notificacion.tipo;
    var titulo = hash_notificacion.titulo;
    var texto = hash_notificacion.texto;

    if (hash_notificacion.hasOwnProperty("acumulable")) {
        acumulable = hash_notificacion.acumulable;
    }
    if (hash_notificacion.hasOwnProperty("flash")) {
        flash = hash_notificacion.flash;
    }

    var cerrar;

    var cadena = texto;

    if (acumulable) {

        if (!document.getElementById("notificacion_acumulable")) {
            notificacion = document.createElement("div");
            notificacion.className = tipo;
            notificacion.id = "notificacion_acumulable";
            var h2 = document.createElement("h2");
            h2.appendChild(document.createTextNode(titulo));
            var div_texto = document.createElement("div");
            div_texto.id = "notificacion_acumulable_texto";
            div_texto.innerHTML = cadena;
            juntaTodo();

        } else
        {
            var div_texto = document.getElementById("notificacion_acumulable_texto");
            div_texto.innerHTML = cadena;
            notificacion = document.getElementById("notificacion_acumulable");
        }

        if (!notificacion.className.match("acumulables_" + hash_notificacion.donde))
            notificacion.className += " acumulables_" + hash_notificacion.donde;

        if (document.getElementById("notificaciones").className.match("escondido"))
            esconderOcultarNotificacionesAlto(); // actualizamos la posición por el nuevo alto de la capa

        fade(notificacion, 0, flash);
    } else
    {
        // no es una notificacion acumulable, es una normal que se apila encima de la otra
        var notificacion = document.createElement("div");
        notificacion.className = tipo;
        // titulo de la notificacion ( sale a la izquierda)
        var h2 = document.createElement("h2");
        h2.appendChild(document.createTextNode(titulo));
        h2.innerHTML += " &raquo; ";
        // texto de la notificacion
        var div_texto = document.createElement("div");
        if (hash_notificacion.html === true) {  // si es html, hacemos un innerHTML
            var p = document.createElement("p"); // si no es html, creamos un p para meter el texto
            var p = document.createElement("p"); // si no es html, creamos un p para meter el texto
            p.innerHTML = texto;
            div_texto.appendChild(p);
        } else {
            var p = document.createElement("p"); // si no es html, creamos un p para meter el texto
            p.appendChild(document.createTextNode(texto));
            div_texto.appendChild(p);
        }

        if (hash_notificacion.tipo == "error") {
            EDITOR_COMUN.errores_tecnicos.push(texto);

            var m;
            var parrafos_avisar = document.getElementsByClassName("avisar_tecnicos"); // ocultamos los otros
            for (m = 0; m < parrafos_avisar.length; m++) {
                parrafos_avisar[m].style.display = "none";
            }
            var cuantos_errores = "este error";
            if (EDITOR_COMUN.errores_tecnicos.length > 1)
                cuantos_errores = "todos estos errores";
            var texto_enviar = "";
            texto_enviar += "USUARIO: " + _nickname + " \n\n";
            texto_enviar += "________________________________________________________________________________________________________________\n\n";
            texto_enviar += "IP:      " + _ip + " \n\n";
            texto_enviar += "________________________________________________________________________________________________________________\n\n";
            texto_enviar += "XML:     " + _ficheroActividad + " \n\n";
            texto_enviar += "________________________________________________________________________________________________________________\n\n";
            texto_enviar += "ERRORES: \n\n";

            for (m = 0; m < EDITOR_COMUN.errores_tecnicos.length; m++) {
                texto_enviar += "   &mdash; " + EDITOR_COMUN.errores_tecnicos[m] + "\n\n";
            }
            var p_avisar = document.createElement("p");
            p_avisar.className = "avisar_tecnicos";
            p_avisar.innerHTML = '<a href="mailto:epet@edicioneselpais.net?subject=Errores del editor&body=' + encodeURI(texto_enviar) + '">Avisar a los técnicos de ' + cuantos_errores + '</a>';
            div_texto.appendChild(p_avisar);
        }
        anadeBotonCerrar();
        juntaTodo();

        fade(notificacion, 0, flash);
    }

    function juntaTodo() {
        notificacion.appendChild(h2);
        notificacion.appendChild(div_texto);
        notificaciones.appendChild(notificacion);
    }


    function anadeBotonCerrar() {
        // boton cerrar
        cerrar = document.createElement("a");
        cerrar.appendChild(document.createTextNode("x"));
        cerrar.setAttribute("href", "javascript:void(0)");
        cerrar.className = "cerrar";
        cerrar.onclick = function () {
            notificaciones.removeChild(notificacion)
        }
        notificacion.appendChild(cerrar);
    }

    function fade(elemento, cont, flash, cuanto) {

        if (elemento.parentNode == null)
            return; // si no existe el div de la notificacion, paramos el fade
        if (!elemento) {
            return;
        }
        if (!cuanto)
            cuanto = 100;
        cuanto -= 5;
        var entiendo_rgba = true;
        try {
            elemento.style.borderColor = "rgba(255,255,255,1)";
        } catch (error) {
            entiendo_rgba = false;
        }

        if (entiendo_rgba) {

            if (cuanto <= 0) {
                cont++;
            }

            if ((cont < 1) && (entiendo_rgba) && (flash)) {
                if ((cuanto < 100) && (cuanto > 90))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.2)";
                if ((cuanto < 90) && (cuanto > 80))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.8)";
                if ((cuanto < 80) && (cuanto > 70))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.2)";
                if ((cuanto < 70) && (cuanto > 60))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.8)";
                if ((cuanto < 60) && (cuanto > 50))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.2)";
                if ((cuanto < 50) && (cuanto > 40))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.8)";
                if ((cuanto < 40) && (cuanto > 30))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.2)";
                if ((cuanto < 30) && (cuanto > 20))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.8)";
                if ((cuanto < 20) && (cuanto > 10))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.2)";
                if ((cuanto < 10) && (cuanto > 00))
                    elemento.parentNode.style.backgroundColor = "rgba(0,0,0,0.8)";
            }

            if ((cuanto < 100) && (cuanto != 0))
                setTimeout(function () {
                    fade(elemento, cont, flash, cuanto);
                }, 100);
        }

    }

}


function cargaOpciones() {

    if (!window.localStorage)
        return;

    var opciones = localStorage.getItem("opciones");

    EDITOR_COMUN.opciones = {};

    if (opciones != null) {
        EDITOR_COMUN.opciones = JSON.parse(opciones);
    }

    if (!EDITOR_COMUN.opciones.hasOwnProperty("fieldset_plegados"))
        EDITOR_COMUN.opciones.fieldset_plegados = [];
    if (!EDITOR_COMUN.opciones.hasOwnProperty("notificaciones_visibles"))
        EDITOR_COMUN.opciones.notificaciones_visibles = 1;

}

function guardaOpciones() {
    if (!window.localStorage)
        return;
    var objeto_string = JSON.stringify(EDITOR_COMUN.opciones);
    localStorage.setItem("opciones", objeto_string);
}


function anadeCssComun() {
    var i;
    var head = document.getElementsByTagName("head")[0];
    var nuevo_css = document.createElement('link');
    nuevo_css.type = 'text/css';
    nuevo_css.rel = 'stylesheet';
    nuevo_css.href = '/editor/estilos/v2.x/v2.0/editor_entrada_comun_v2.css';
    head.appendChild(nuevo_css);
}


function compruebaPublicable() {
    if (document.getElementById("opcion_es_publicable_si")) {
        var campo_publicable_si = document.getElementById("opcion_es_publicable_si");
        campo_publicable_si.onchange = function () {
            ponEstiloPublicable();
        };
        document.getElementById("opcion_es_publicable_no").onchange = function () {
            ponEstiloPublicable();
        };
        ponEstiloPublicable();
    }
    function ponEstiloPublicable() {
        var clase;
        if (campo_publicable_si.checked) {

            clase = campo_publicable_si.parentNode.parentNode.className;
            clase = clase.replace(" seccion_buscador_no_publicable", "");
            clase += " seccion_buscador_publicable";
            campo_publicable_si.parentNode.parentNode.className = clase;
        } else
        {
            clase = campo_publicable_si.parentNode.parentNode.className;
            clase = clase.replace(" seccion_buscador_publicable", "");
            clase += " seccion_buscador_no_publicable";
            campo_publicable_si.parentNode.parentNode.className = clase;
        }
    }
}


function init() {

    var i;
    anadeCssComun();

    window.onscroll = function () {
        scrollHecho();
    } // necesario para resaltar la opción del menú actual

    compruebaPublicable(); // ponemos verde o rojo el indicador de Publicable de arriba a la derecha
    anadeAyuda(); // añadimos los enlaces a la ayuda en los campos correspondientes
    if (document.getElementById("seccion_cuerpo_noticia"))
        activaTinyMCE();
    hazTextAreasElasticos(); // hace que los textareas crezcan en altura según el contenido



    function hazTextAreasElasticos() { // hace que los textareas crezcan en altura según el contenido

        var contenedor = document.getElementById("formulario");
        var textareas = contenedor.getElementsByTagName("textarea");
        for (i = 0; i < textareas.length; i++) {
            if (obtieneEstiloComputado(textareas[i], "display") != "none") {
                ajustaAltoTextArea(textareas[i]);
                textareas[i].onclick = function () {
                    var that = this;
                    ajustaAltoTextArea(that);
                };
                textareas[i].onkeyup = function (e) {
                    var that = this;
                    setTimeout(function () {
                        ajustaAltoTextArea(that);
                    }, 1);
                };
                textareas[i].onblur = function () {
                    var that = this;
                    ajustaAltoTextArea(that);
                };
                textareas[i].onpaste = function () {
                    var that = this;
                    ajustaAltoTextArea(that);
                };
            }
        }


        function ajustaAltoTextArea(div) {

            if (div.id == "id_campo_formulario_cuerpo")
                return;  // si es cuerpotexto, no ajustamos el alto del textarea porque puede ser muy alto

            var alto_textarea = div.scrollHeight - 16;  // elemento 6 es por elemento padding

            var texto_temp; // para pillar bien elemento alto del textarea, tengo que crear un div oculto con elemento mismo texto y estilo y pillarlo de ahí
            if (!document.getElementById("texto_temp")) {
                texto_temp = document.createElement("div");
                texto_temp.className = "espejo_textarea_oculto";
                texto_temp.id = "texto_temp";
                document.getElementById("formulario").appendChild(texto_temp);
            }

            texto_temp = document.getElementById("texto_temp");

            texto_temp.style.fontFamily = obtieneEstiloComputado(div, "fontFamily");
            texto_temp.style.fontSize = obtieneEstiloComputado(div, "fontSize");
            texto_temp.style.letterSpacing = obtieneEstiloComputado(div, "letterSpacing");
            texto_temp.style.lineHeight = obtieneEstiloComputado(div, "lineHeight");
            texto_temp.style.fontWeight = obtieneEstiloComputado(div, "fontWeight");

            var codigo_html = div.value;
            codigo_html = codigo_html.replace(/[\r\n]/g, "<br>"); // cambiamos los \n por <br>

            texto_temp.innerHTML = codigo_html;
            var ancho = (div.offsetWidth - 26);
            if (ancho < 0)
                ancho = 0; // a IE no le gustan nada los anchos negativos
            texto_temp.style.width = ancho + "px";
            div.style.height = 0;
            var alto_ajustado = (texto_temp.offsetHeight + 10);
            if (alto_ajustado < 30)
                alto_ajustado = 30;
            div.style.height = alto_ajustado + "px";
        }


    }

}

function procesaErroresH2() {
    // miramos si hay errores oscar-style
    var hijos_body = document.body.childNodes;
    for (i = 0; i < hijos_body.length; i++) {

        if (hijos_body[i].tagName == "H2") {

            hijos_body[i].style.display = "none";

            if ((hijos_body[i].innerHTML).indexOf("no se genera el fichero html") == -1) {

                var error = {titulo: "ATENCIÓN", tipo: "error", texto: hijos_body[i].innerHTML, html: true};
                anadeNotificacion(error);
            } else // detectamos si el error sobre no generar HTML de noticias publicadas. En ese caso lo colocamos en cuerpo_noticia, arriba del todo
            {
                if (document.getElementById("formulario") && (document.getElementById("seccion_multimedia"))) {
                    var formulario = document.getElementById("formulario");
                    var seccion_multimedia = document.getElementById("seccion_multimedia");
                    var mensaje = document.createElement("div");
                    var p = document.createElement("p");
                    mensaje.className = "mensaje mensaje_no_publicadas";
                    p.appendChild(document.createTextNode(hijos_body[i].innerHTML));
                    mensaje.appendChild(p);
                    formulario.insertBefore(mensaje, seccion_multimedia);
                }
            }
        }
    }
}


function obtieneEstiloComputado(elemento, nombrePropiedadEstilo) {

    var y;
    if (elemento.currentStyle) // IE
        y = elemento.currentStyle[nombrePropiedadEstilo];
    else if (window.getComputedStyle) // Demás navegadores
        y = window.getComputedStyle(elemento, null)[nombrePropiedadEstilo];
    return y;
}

/* ayuda */

function muestraAyuda(url, enlace) {

    var ayuda, ayuda_contenido;
    if (!document.getElementById("ayuda")) {
        ayuda = document.createElement("div");
        ayuda.id = "ayuda";
        document.getElementById("formulario").appendChild(ayuda);
        ayuda_contenido = document.createElement("div");
        ayuda_contenido.id = "ayuda_contenido";

        var div_boton_cerrar = document.createElement("div");
        div_boton_cerrar.className = "cerrar";
        var a_boton_cerrar = document.createElement("a");
        a_boton_cerrar.appendChild(document.createTextNode("cerrar"));
        a_boton_cerrar.onclick = function () {
            ocultaAyuda();
        }
        div_boton_cerrar.appendChild(a_boton_cerrar);
        ayuda.appendChild(div_boton_cerrar);
        ayuda.appendChild(ayuda_contenido);
        var div = document.createElement("div");

        div.style.clear = "both";
        ayuda.appendChild(div);
    }
    ayuda = document.getElementById("ayuda");
    ayuda_contenido = document.getElementById("ayuda_contenido");
    ayuda.style.display = "block";

    var ruta = "/editor/ayuda/"
    ajaxCargaHTML(ruta + url + ".html", "ayuda_contenido");

    ayuda.style.top = (enlace.offsetTop + 40) + "px";

}

function ocultaAyuda() {

    var ayuda = document.getElementById("ayuda");
    ayuda.style.display = "none";

}

function ajaxCargaHTML(url, id) {

    var req;
    //document.getElementById(id).innerHTML = '<div class="cargando">cargando</div>';
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        req = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (req != undefined) {
        req.onreadystatechange = function () {
            ajaxCargaHTMLHecho(url, id);
        };
        req.open("GET", url, true);
        req.send("");
    }

    function ajaxCargaHTMLHecho(url, id) {
        if (req.readyState == 4) { // solo si req tiene el valor propio de "loaded"
            if (req.status == 200) { // solo si todo ha ido bien con el valor "OK"
                document.getElementById(id).innerHTML = req.responseText;

                var scripts = document.getElementById(id).getElementsByTagName("script");
                if (scripts.length > 0)
                    eval(scripts[0].innerHTML);

            } else {
                alert("Error cargando HTML");
            }
        }
    }
}



function ayudaActivaPestana(cual, id_contenido) {
    var i;

    var contenido = document.getElementById(id_contenido);
    var divs = contenido.getElementsByTagName("div");
    for (i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }

    var lis = (cual.parentNode.parentNode);
    var hijos = (lis.childNodes);
    for (i = 0; i < hijos.length; i++) {

        if (hijos[i].tagName == "LI")
            hijos[i].className = "inactivo";
    }

    cual.parentNode.className = "activo";


    var id = (cual.id);
    document.getElementById("contenido_" + id).style.display = "block";


}


function anadeAyuda() {

    var cont = 1;
    var i;

    if (document.body.id == "editor_noticia") { // sólo añadimos ayuda en el editor de entrada de noticia

        do {
            cadena = "id_campo_formulario_sumarios_x2F_sumario" + cont + "_x2F_datos_comunes_x2F_modelo_sumario";
            if (document.getElementById(cadena)) {
                var url = "sumarios";
                anadeInterrogacion(cadena, url);

                var cadena2 = "id_campo_formulario_sumarios_x2F_sumario" + cont + "_x2F_datos_particulares_x2F_codigo_encuesta";
                var url = "encuesta";
                anadeInterrogacion(cadena2, url);

            } else
            {
                break;
            }

            cont++;


        } while (cont < 50);

        campo = "id_campo_formulario_es_colgante";
        url = "hija";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_enlaceespecial";
        url = "enlace";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_desactivar_cintillo_en_portadilla_para_destacadasizquierda";
        url = "cintillo_portadilla";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_subtitulo";
        url = "subtitulo";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_cintillo_tipo";
        url = "cintillo_grafico";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_forma_parte_de_una_serie";
        url = "serie";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_encabezado_texto";
        url = "encabezados_libres";
        anadeInterrogacion(campo, url);

        campo = "id_campo_formulario_pretitulo_seo";
        url = "pretitulo_seo";
        anadeInterrogacion(campo, url);

        var campos = ["id_campo_formulario_titulo", "id_campo_formulario_titulo_portadilla", "id_campo_formulario_titulo_portada"];

        for (i = 0; i < campos.length; i++) {

            anadeCaracterEspecial(campos[i], "“", "comillas_abrir");
            anadeCaracterEspecial(campos[i], "”", "comillas_cerrar");
            anadeCaracterEspecial(campos[i], "‘", "comillas_simple_abrir");
            anadeCaracterEspecial(campos[i], "’", "comillas_simple_cerrar");
            anadeCaracterEspecial(campos[i], "—", "guion");
            anadeCaracterEspecial(campos[i], "<sub>2</sub>", "subindice2");
            anadeCaracterEspecial(campos[i], "<sup>2</sup>", "superindice2");
            anadeCaracterEspecial(campos[i], "<sup>3</sup>", "superindice3");
        }



    }


    function anadeInterrogacion(campo, url) {

        if (!document.getElementById(campo))
            return;
        var campo = document.getElementById(campo);
        var padre = campo.parentNode;
        var span = document.createElement("span");
        span.className = "ayuda";
        var a = document.createElement("a");
        a.setAttribute("href", "javascript:void(0)");
        a.onclick = function () {
            var that = this;
            muestraAyuda(url, that.parentNode)
        };
        a.appendChild(document.createTextNode("?"));
        span.appendChild(a);
        padre.appendChild(span);
    }


    function anadeCaracterEspecial(campo, caracter, clase) {
        var i;
        if (!document.getElementById(campo))
            return; // protegemos
        var campo = document.getElementById(campo);
        var padre = campo.parentNode;
        var span = document.createElement("span");
        span.innerHTML = "&laquo; insertar:<br>";
        var primero = true;
        var spans = padre.getElementsByTagName("span");
        for (i = 0; i < spans.length; i++) {
            if (spans[i].className == "botones_simbolos") {
                span = spans[i];
                primero = false;
                break
            } // si ya existe el span padre, no lo creamos
        }
        span.className = "botones_simbolos";

        var a = document.createElement("a");
        a.setAttribute("href", "javascript:void(0)");
        a.onclick = function () {
            var pos = campo.selectionStart;
            var parte1 = campo.value.substr(0, pos);
            var parte2 = campo.value.substr(pos, campo.value.length - pos);
            campo.value = parte1 + caracter + parte2;
            campo.focus();
            campo.setSelectionRange(pos + caracter.length, pos + caracter.length);

        };
        a.innerHTML = caracter;
        a.className = clase;
        a.setAttribute("title", "Insertar el carácter " + caracter + " en la posición actual");
        span.appendChild(a);
        if (primero)
            padre.appendChild(span);
    }

}




function accionesOnload() {

    var i;

    cargaOpciones();

    procesaErroresH2(); // mueve los H2 de errores al sistema nuevo de notificacion de errores que sale abajo

    // estos ids de bodies son en los que vamos a soportar lo de vigilar la actividad
    var bodies = ["portada", "portadilla", "editor_visual", "editor_fotos_video_audio", "editor_fotos_recortar", "noticia", "editor_fotos_recortadas", "editor_visual_bloques", "editor_concursos"];

    for (i = 0; i < bodies.length; i++) {
        if (document.body.id == bodies[i]) {
            anadeCssComun();
            break
        }
    }

    if (window.location.href.match("editor_visual"))
        anadeCssComun();


}



// añadimos un evento de onload al body, sin afectar a otros que ya existan
if (document.addEventListener) {
    window.addEventListener("load", accionesOnload, false);
} else {
    window.attachEvent('onload', accionesOnload); //IE
}



//Funciones para generar el codigo para insertar el video en los blogs
function objetoVideo(datos)
{
    var rand = String(Math.random()).substr(2, 9);
    var codigo = "<script language='JavaScript' type='text/javascript'>\n" +
            "var datosVideo_" + rand + " = {};\n" +
            "datosVideo_" + rand + ".playerEPET = url_reproductor_epet;\n" +
            "datosVideo_" + rand + ".playerEPETParams = {};\n" +
            "datosVideo_" + rand + ".anchoPlayer = " + datos.anchoPlayer + ";\n" +
            "datosVideo_" + rand + ".altoPlayer = " + datos.altoPlayer + ";\n" +
            "datosVideo_" + rand + ".playerEPETParams.mediaWidth = datosVideo_" + rand + ".anchoPlayer;\n" +
            "datosVideo_" + rand + ".playerEPETParams.mediaHeight = datosVideo_" + rand + ".altoPlayer;\n" +
            "datosVideo_" + rand + ".playerEPETParams.URLMediaFile = url_cache + '" + datos.playerEPETParams.URLMediaFile.replace(url_cache, "") + "';\n" +
            "datosVideo_" + rand + ".playerEPETParams.URLMediaStill = url_cache + '" + datos.playerEPETParams.URLMediaStill.replace(url_cache, "") + "';\n" +
            "datosVideo_" + rand + ".playerEPETParams.URLFirstFrame = url_cache + '" + datos.playerEPETParams.URLFirstFrame.replace(url_cache, "") + "';\n" +
            "datosVideo_" + rand + ".playerEPETParams.compactMode = 'false';\n" +
            "datosVideo_" + rand + ".playerEPETOpcionesSWF = {\"allowfullscreen\":\"true\"};\n" +
            "datosVideo_" + rand + ".idRefBrightcove = '" + datos.idRefBrightcove + "';\n" +
            "datosVideo_" + rand + ".publiActiva = 'true';\n" +
            "datosVideo_" + rand + ".keywordsVideo = '" + datos.keywordsVideo + "';\n" +
            "datosVideo_" + rand + ".tagsIds = '';\n" +
            "datosVideo_" + rand + ".tagsNombreNormalizado = '';\n" +
            "datosVideo_" + rand + ".urlNoticia = document.location.href;\n" +
            "datosVideo_" + rand + ".tituloVideo = '" + (datos.tituloVideo ? datos.tituloVideo.replace(/'/g, "\\'") : "") + "';\n" +
            "datosVideo_" + rand + ".playerVideo = '0';\n" +
            "VideoPlayerBC_BLOGS(datosVideo_" + rand + ");\n" +
            "<\/script>";
    return  codigo;
}

function f_muestra_codigo_para_typepad(idCampoTypePad, datosVideo) {
    //Marcamos el ancho mas comun que tienen los blogs, pero despues debería ajustarse al vuelo
    var anchoDefecto = 520;
    datosVideo.altoPlayer = Math.round(anchoDefecto * datosVideo.altoPlayer / datosVideo.anchoPlayer)
    datosVideo.anchoPlayer = anchoDefecto;

    var codigo_typepad = objetoVideo(datosVideo);

    if (document.getElementById(idCampoTypePad)) {
        document.getElementById(idCampoTypePad).value = codigo_typepad;
        document.getElementById(idCampoTypePad).onclick = function () {
            this.focus();
            this.select()
        };
        if (!document.getElementById('aviso'))
        {
            newNodo = document.createElement('div');
            newNodo.id = 'aviso';
            //newNodo.style.width = document.getElementById(idCampoTypePad).parentNode.offsetWidth + 'px';
            newNodo.style.backgroundColor = '#bbffbb';
            newNodo.style.margin = '10px';
            newNodo.style.padding = '10px';
            newNodo.innerHTML = "Nota: Ha cambiado el código, pero el funcionamiento es el mismo. Seleccionar, copiar e insertar en Typepad.";
            document.getElementById(idCampoTypePad).parentNode.appendChild(newNodo);
        }
    }

}


function bloqueaTodoMenosEsto(p) {  // saca dos cortinas que bloquean el contenido, una por encima del div y otra por debajo hasta el final de la página
    // parámetros:
    // 	 para activar: { id:HTML_ELEMENT->cualquier elemento contenido en el div que se va a dejar visible,
    //	      		     clase_padre:STRING->clase del padre que hay que dejar visible) }
    // 	 para quitar:  { quitar:true }

    var div = document.getElementById(p.id);

    if (p.hasOwnProperty("quitar")) { // restauramos el alto del div
        if (p.quitar === true) {
            if (document.getElementById("cortina1")) {
                document.getElementById("cortina1").style.display = "none";
                document.getElementById("cortina2").style.display = "none";
                document.getElementById("fijo_cortina").style.display = "none";
            }
            div.style.height = "auto";
            return
        }
    }

    div.style.height = div.offsetHeight + "px"; // forzamos alto fijo del div

    if (!document.getElementById("cortina1")) {
        var cortina1 = document.createElement("div");
        cortina1.id = "cortina1";
        cortina1.className = "cortina_parcial";
        var cortina2 = document.createElement("div");
        cortina2.id = "cortina2";
        cortina2.className = "cortina_parcial";
        document.getElementById("contenedor").appendChild(cortina1);
        document.getElementById("contenedor").appendChild(cortina2);
        var fijo = document.createElement("div");
        fijo.id = "fijo_cortina";
        fijo.className = "fijo_cortina";
        document.getElementById("contenedor").appendChild(fijo);

    } else {
        var cortina1 = document.getElementById("cortina1");
        var cortina2 = document.getElementById("cortina2");
        var fijo = document.getElementById("fijo");
        cortina1.style.display = "block";
        cortina2.style.display = "block";
        fijo.style.display = "block";
    }

    var alto = div.offsetHeight;
    var pos_y = div.offsetTop;
    var alto_body = document.body.offsetHeight;
    cortina1.style.height = pos_y + "px";
    cortina2.style.top = (pos_y + alto) + "px";
    cortina2.style.height = (alto_body - pos_y) + "px";
}

