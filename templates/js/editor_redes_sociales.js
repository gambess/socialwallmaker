$(document).ready(function () {

    var dataTable = $('.datatable').DataTable({
        "ordering": false,
        "language": lang
    });
    
    /**
     * Función específica para el plugin datatables.
     * Permite seleccionar todos los elementos de varias tablas pasadas por el
     * atributo data-tables (ej: tabla1, tabla2, ... tablaN)
     * Los checkbox seleccionables deberán estar contenidos un div con la clase 'checkall'
     */
    $('.select-all-tables').on('click', function () {
        var element = $(this);
        var formName = element.attr('data-form').replace(/\s/g, '');
        var self = this;
        
        $('#' + formName).find($('table')).each(function() {
            var table = $(this);
            var rows = table.dataTable().api().rows({'search': 'applied'}).nodes();
            
            // Check/uncheck checkboxes para todas las filas de la tabla
            $('.checkall > input[type="checkbox"]', rows).prop('checked', self.checked);
            // Uncheck el resto de checkboxes
            $('.checkoption > input[type="checkbox"]', rows).prop('checked', false);
        });

        // Permite hacer check/uncheck sobre los checkboxes
        if (element.attr('type') == 'button') {
            this.checked = this.checked === true ? false : true;
        }
    });
    
    /**
     * Función del botón actualizar que comprueba si existen checkboxes activas
     * para realizar el envío del formulario. (obtenidos, borrados, buscador, etc..)
     * Renderiza la tabla datatable para permitir el envío de todos los campos
     * seleccionados, y posteriormente se realiza el submit del formulario.
     */
    $('.boton_actualizar').on('click', function () {
        var element = $(this);
        var formName = element.attr('data-form').replace(/\s/g, '');
        var value = element.val();
        var checked = false;
        var tables = [];
        
        // Comprobamos si existe al menos un elemento seleccionado (checked = true).
        $('#' + formName).find($('table')).each(function() {
            var table = $(this);
            tables.push(table.dataTable().api());
            
            table.find($('input[type="checkbox"]')).each(function() {
                var checkbox = $(this);
                
                if (checkbox.is(':checked')) {
                    checked = true;
                }
            });
        });
        
        if (checked === false) {
            bootbox.alert("Debe seleccionar al menos un registro para " + value.toLowerCase(), function() {});
        } else {
            mostrarVentanaModalEspera();
            // Dibujamos las tablas (dataTables) para permitir el envío de todos los campos por el submit.
            for (var x = 0; tables.length > x; x++) {
                tables[x].rows().invalidate().draw();
                tables[x].rows().nodes().page.len(-1).draw();
            }
            
            document.getElementById(formName).submit();
        }
    });
    
    /**
     * Función para recargar los contenidos sociales obtenidos.
     */
    $('.boton_recargar').on('click', function () {
        mostrarVentanaModalEspera();
        var element = $(this);
        var href = element.attr('data-href');
        
        document.location.href=href;
    });
    
    /**
     * Función para hacer uncheck sobre los checkbox diferentes al pulsado, dentro
     * de una misma fila.
     */
    $(".check-option").on('click', function () {
        var checkbox = $(this);
        var order = parseInt(checkbox.attr('data-order'));
        
        if (order === 1) {
            var checkbox2 = checkbox.parent().next().children();
            var checkbox3 = checkbox.parent().next().next().children();
            checkbox2.attr('checked', false);
            checkbox3.attr('checked', false);
        }
        
        if (order === 2) {
            var checkbox3 = checkbox.parent().next().children();
            var checkbox1 = checkbox.parent().prev().children();
            checkbox1.attr('checked', false);
            checkbox3.attr('checked', false);
        }
        
        if (order === 3) {
            var checkbox1 = checkbox.parent().prev().prev().children();
            var checkbox2 = checkbox.parent().prev().children();
            checkbox1.attr('checked', false);
            checkbox2.attr('checked', false);
        }
    });
    
    /**
     * Borra el campo input de búsqueda para los hashtags.
     */
    $('.dev_clear-input > .clear').on('click', function () {
        var searchInput = $("input[name='buscar']");
        searchInput.val('')
    });
    
    /**
     * Gestión de las tabs de las diferentes secciones.
     */
    $("ul.nav-tabs a").click(function (e) {
        e.preventDefault();
        var target = $(e.target);
        if (target.is('a[href*="#_publicados"]')) {
            $("#todos").hide();
        } else {
            $("#todos").show();
        }
        $(this).tab('show');
    });
    
    /**
     * Activa el tooltip de bootstrap
     */
    $('[data-toggle="tooltip"]').tooltip({html:true, container: 'body', animation: true});
    
    
    $('.boton_buscar').on('click', function () {
        mostrarVentanaModalEspera();
    });
    
    $('.dev_spinner_container').hide();
    
    mostrarVentanaModalNotificaciones();
    
});

/**
 * Muestra la ventana modal si se han generado notificaciones al generar la página.
 * @return void
 */
function mostrarVentanaModalNotificaciones() {
    var notificacionesDiv = $('.dev_notificaciones');
    var show = notificacionesDiv.attr('data-show');
    
    if (show == 'true') {
        var contenido = notificacionesDiv.html();
        
        bootbox.dialog({
            message: contenido,
            title: "Resultado",
            buttons: {
                main: {
                    label: "Aceptar",
                    className: "btn-primary",
                    callback: function () {
                    }
                }
            }
        });
    }
}

/**
 * Muestra la ventana modal de espera cuando se realiza alguna operación que consuma
 * un tiempo de procesado.
 * @return void
 */
function mostrarVentanaModalEspera() {
    bootbox.dialog({
        closeButton: false,
        message: $('.dev_spinner_container').html(),
    });
}
