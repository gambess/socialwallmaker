
function pintaErrorEnNotificacion(errorCode, datos) {
    anadeNotificacion({ titulo:"ERROR",tipo:"error",texto:"[error " + errorCode + "][datos " + datos  + "]" }); 
}

// Procesa el hash de datos de actividad del editor recibido por Ajax
function procesarDatosActividadEditor(hashDatosNuevos) {
    

    var hashUsuariosParaPortadilla = Array();
    var hashUsuariosParaNoticia    = Array();

    for (var i = 0; i != hashDatosNuevos.actividadNoticia.length; i++) {
        var htmlNotif = "";
        var esNuevo = false;
        var eresTu  = "";
        if (typeof _hashDatosActividad.actividadNoticia != "undefined") {
            esNuevo = true;
            // Comparamos con los datos de actividad antiguos, si hay algun usuario nuevo editando
            for (var j = 0; j != _hashDatosActividad.actividadNoticia.length; j++) {
                if (_hashDatosActividad.actividadNoticia[j].usuario == hashDatosNuevos.actividadNoticia[i].usuario &&
                    _hashDatosActividad.actividadNoticia[j].ip == hashDatosNuevos.actividadNoticia[i].ip) {
                    esNuevo = false;
                    break;
                }
            }
        }
        // Si la entrada de actividad no ha caducado...
        if (hashDatosNuevos.ts < (parseInt(hashDatosNuevos.actividadNoticia[i].ts)+_segCaducidad)) {
            // Si es la entrada correspondiente al este usuario, la saltamos
            if (hashDatosNuevos.actividadNoticia[i].usuario == _nickname) {
                if (hashDatosNuevos.actividadNoticia[i].ip == _ip) {
                    // eresTu = " (eres tú)";
                    continue;
                } else {
                    // Si es el mismo usuario desde otra IP, lo avisamos...
                    eresTu = " (tu mismo usuario) ";
                }
            }
            var hashUsuario = hashDatosNuevos.actividadNoticia[i];
            if (esNuevo) {
                // Se notifica si algun usuario entra a editar este mismo fichero
                hashUsuario.nuevo = 1;
                if (typeof _es_portadilla != "undefined" && _es_portadilla == 1) {
                    hashUsuariosParaPortadilla.push(hashUsuario);
                } else {
//                    anadeNotificacion({ titulo:"ATENCIÓN",tipo:"advertencia",texto:"" + hashUsuario.nombre + " (" + hashUsuario.usuario+ ", " + hashUsuario.email + ") " + eresTu + " ha entrado a editar esta noticia/portadilla (IP: " + hashDatosNuevos.actividadNoticia[i].ip + ")" });
                    hashUsuariosParaNoticia.push(hashUsuario);
                }
            } else {
                hashUsuario.nuevo = 0;
                if (typeof _es_portadilla != "undefined" && _es_portadilla == 1) {
                    hashUsuariosParaPortadilla.push(hashUsuario);
//                } else if (_es_primera_carga) {
                } else {
                    hashUsuariosParaNoticia.push(hashUsuario);
                    // En la primera carga de la pagina se notifica quien estaba editando el fichero previamente (en noticia)
//                    anadeNotificacion({ titulo:"ATENCIÓN",tipo:"advertencia",texto:"" + hashUsuario.nombre + " (" + hashUsuario.usuario+ ", " + hashUsuario.email + ") " + eresTu + " ya estaba editando esta noticia/portadilla (IP: " + hashDatosNuevos.actividadNoticia[i].ip + ")" });
                }
            }
        }
    }

    // En portadillas se muestra constantemente la gente que esta editando en una caja separada
    if (typeof _es_portadilla != "undefined" && _es_portadilla == 1) {
        anadeNotificacionUsuariosEditando(hashUsuariosParaPortadilla, "portadilla");
    } else if (typeof _es_editor_social != "undefined" && _es_editor_social == 1) {
        anadeNotificacionUsuariosEditando(hashUsuariosParaNoticia, "editorsocial");
    } else {
        anadeNotificacionUsuariosEditando(hashUsuariosParaNoticia, "noticia");
    }

    _es_primera_carga = 0;

    _hashDatosActividad = hashDatosNuevos;

    // Si es mas nuevo...
    if (typeof _ultimaModificacion != "undefined" &&
               (_ultimaModificacion.ts+1) < hashDatosNuevos.ultimaModificacion.ts) {

        // Si no soy yo o bien se hace desde otra IP...
        if ((typeof hashDatosNuevos.ultimaModificacion.usuario == "undefined") ||
            (typeof hashDatosNuevos.ultimaModificacion.usuario != "undefined" &&
               hashDatosNuevos.ultimaModificacion.usuario != _nickname) ||
            (typeof hashDatosNuevos.ultimaModificacion.ip != "undefined" &&
               hashDatosNuevos.ultimaModificacion.ip != _ip)) {

            var fechaModificacion = new Date(hashDatosNuevos.ultimaModificacion.ts*1000);
            var hora = fechaModificacion.getHours();
            var minuto = fechaModificacion.getMinutes();
            var segundo = fechaModificacion.getSeconds();
            if (hora < 10) hora = "0" + hora;
            if (minuto < 10) minuto = "0" + minuto;
            if (segundo < 10) segundo = "0" + segundo;
            var datosExtra = '';
            if (typeof hashDatosNuevos.ultimaModificacion.usuario != "undefined") {
                datosExtra = " por " + hashDatosNuevos.ultimaModificacion.nombre + " (" + hashDatosNuevos.ultimaModificacion.usuario + ", " + hashDatosNuevos.ultimaModificacion.email + ") ";
            }
            anadeNotificacion({ titulo:"ATENCIÓN",tipo:"error",acumulable:0,texto:"Modificación a las " + hora + ":" + minuto + ":" + segundo + " " + datosExtra + " desde otro editor. Si actualizas se podrían perder datos."});

        }

    }

    _ultimaModificacion = hashDatosNuevos.ultimaModificacion;
}

// Notifica que el usuario ha entrado en el editor
function notificacionEdicionFichero() {
    
    var parametrosPeticion = "rnd=" + Math.random() + "&accion=add&nickname=" + _nickname + "&fichero=" + _ficheroActividad + "&ip=" + _ip;

    EPETUtils_makeHttpRequestGet(function(httpRequest) {

        if (httpRequest.status != 200) {
            // Error notificando/obteniendo datos
            // pintaErrorEnNotificacion("-1", "");
        } else {
            // Datos obtenidos correctamente

            var hashDatos = Array();
            var data = httpRequest.responseText;
            
            // se evalua y guarda la informacion recibida en una variable de javascript
            try {
                eval("hashDatos = " + data);
                // Se procesan los datos obtenidos
                procesarDatosActividadEditor(hashDatos);
            } catch(e) {
                // pintaErrorEnNotificacion("-2 " + e.toString(), data);
            }

        }

    }, _urlServicioActividadEditor + "?" + parametrosPeticion);

}

// Notifica que el usuario ha actualizado el fichero
function notificacionEscrituraFichero() {

    var parametrosPeticion = "rnd=" + Math.random() + "&accion=write&nickname=" + _nickname + "&fichero=" + _ficheroActividad + "&ip=" + _ip;

    EPETUtils_makeHttpRequestGet(function(httpRequest) {

        if (httpRequest.status != 200) {
            // Error notificando/obteniendo datos
// Chrome devuelve status 0, pero la notificacion se hace correctamente. Mejor no pintamos error para no equivocar
//            pintaErrorEnNotificacion("-6", "");
        } else {
//alert("OK!");
            // Notificacion correcta, no hacemos nada

        }

    }, _urlServicioActividadEditor + "?" + parametrosPeticion);

}

// Notifica cuando el usuario sale del editor
function notificacionFinEdicion() {

    var parametrosPeticion = "rnd=" + Math.random() + "&accion=del&nickname=" + _nickname + "&fichero=" + _ficheroActividad + "&ip=" + _ip;

    EPETUtils_makeHttpRequestGet(function(httpRequest) {

        if (httpRequest.status != 200) {
            // Error notificando/obteniendo datos
//            pintaErrorEnNotificacion("-3", "");
        } else {
            // Notificacion correcta, no hacemos nada

        }

    }, _urlServicioActividadEditor + "?" + parametrosPeticion);

}

// Recupera la actividad relacionada con el fichero que estamos editando
function recuperarActividadEditor() {

    var parametrosPeticion = "rnd=" + Math.random() + "&accion=info&fichero=" + _ficheroActividad + "&ip=" + _ip;

    EPETUtils_makeHttpRequestGet(function(httpRequest) {

        if (httpRequest.status != 200) {
            // Error notificando/obteniendo datos
            // pintaErrorEnNotificacion("-4", "");
        } else {
            // Datos obtenidos correctamente

            var hashDatos = Array();
            var data = httpRequest.responseText;

            // se evalua y guarda la informacion recibida en una variable de javascript
            try {
                eval("hashDatos = " + data);
                // Se procesan los datos obtenidos
                procesarDatosActividadEditor(hashDatos);
            } catch(e) {
                // pintaErrorEnNotificacion("-5", "");
            }

        }

    }, _urlServicioActividadEditor + "?" + parametrosPeticion);


}

function lanzaThreadNotificacion() {
    if (typeof _threadNotificacion == "undefined") {
        // _threadNotificacion = setInterval(notificacionEdicionFichero, 5000);
        _threadNotificacion = setInterval(notificacionEdicionFichero, 10000);
    }
}

// Asocia las notificaciones a los eventos de la ventana y los botones de actualizacion
// de la pagina.
function iniciarGestorActividad() {

    if (_nickname && _ficheroActividad) {

        if (window.addEventListener) {
            window.addEventListener('load', notificacionEdicionFichero, false);
            window.addEventListener('load', lanzaThreadNotificacion, false);
            window.addEventListener('unload', notificacionFinEdicion, false);
            window.addEventListener('mouseover', lanzaThreadNotificacion, false);
            window.addEventListener('focus', lanzaThreadNotificacion, false);
        } else if (window.attachEvent) {
            window.attachEvent('onload', notificacionEdicionFichero);
            window.attachEvent('onload', lanzaThreadNotificacion);
            window.attachEvent('onunload', notificacionFinEdicion);
            window.attachEvent('onmouseover', lanzaThreadNotificacion);
            window.attachEvent('onfocus', lanzaThreadNotificacion);
        }

        var botones = document.getElementsByTagName("input");
        var botonCorregir = undefined;
        var botonActualizar = undefined;
        
        
        if ($('.boton_recargar').is(':visible')) {
            $('.boton_recargar').on('click', notificacionEscrituraFichero());
        }
        
        if ($('.boton_actualizar').is(':visible')) {
            $('.boton_actualizar').on('click', notificacionEscrituraFichero());
        }
        
        if ($('.boton_crear').is(':visible')) {
            $('.boton_crear').on('click', notificacionEscrituraFichero());
        }
        
        if ($('.boton_guardar').is(':visible')) {
            $('.boton_guardar').on('click', notificacionEscrituraFichero());
        }
        
        if ($('.boton_buscar').is(':visible')) {
            $('.boton_buscar').on('click', notificacionEscrituraFichero());
        }
        
        if ($('.boton_enviar_a_obtenidos').is(':visible')) {
            $('.boton_enviar_a_obtenidos').on('click', notificacionEscrituraFichero());
        }

    }

}

