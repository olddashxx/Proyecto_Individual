$(document).ready(function() {
    var CLAVE_COLA_OFFLINE = 'portafolio_cola_offline';
    var totalLikes = 0;

    // Registro seguro en la Bitácora de Eventos (Base Semana 1)
    function registrarBitacora(tipo, mensaje) {
        var hora = new Date().toLocaleTimeString();
        var $item = $('<div>').text('[' + hora + '] ' + tipo + ': ' + mensaje);
        $('#logOutput').prepend($item);
    }

    // 1. Simulación de Hidratación SSR en PWA (Guía Memory Leaks & Hidratación)
    function hidratarInterfaz() {
        var $box = $('#contenedorMenu');
        if ($box.attr('data-hidratado') === 'true') return;

        $('#hamburgerBtn')
            .text('☰')
            .removeClass('btn-estatico')
            .off('click')
            .on('click', function() {
                $('#navMenu').slideToggle(300);
                registrarBitacora('MENU_TOGGLE', 'Despliegue de menú hamburguesa PWA');
            });

        $box.attr('data-hidratado', 'true');
        registrarBitacora('HIDRATACION_SSR', 'Contenedor #contenedorMenu hidratado con éxito');
    }

    setTimeout(hidratarInterfaz, 500);

    // Cerrar menú al navegar en móviles sin acumular listeners
    $(document).off('click', '#navMenu a[href^="#"]').on('click', '#navMenu a[href^="#"]', function() {
        $('#navMenu').slideUp(200);
    });

    // 2. Modo Oscuro / Modo Claro Dinámico (Base Semana 1)
    $(document).off('click', '#themeBtn').on('click', '#themeBtn', function() {
        $('body').toggleClass('dark-mode');
        var modo = $('body').hasClass('dark-mode') ? 'Oscuro' : 'Claro';
        $(this).text($('body').hasClass('dark-mode') ? '☀️ Claro' : '🌓 Oscuro');
        registrarBitacora('DARK_MODE', 'Tema cambiado a Modo ' + modo);
    });

    // 3. Lógica del Filtro de 3 Capas en Cascada (con limpieza .off() anti-Memory Leak)
    $(document).off('change', '#capa1').on('change', '#capa1', function() {
        var valor = $(this).val();
        var $capa2 = $('#capa2');

        $capa2.html('<option value="">-- Seleccione opción --</option>').prop('disabled', false);

        if (valor === 'academico') {
            $capa2.append('<option value="web2">Diseño Web II (SIS-0141)</option>');
            $capa2.append('<option value="prog">Programación Avanzada</option>');
        } else if (valor === 'desarrollo') {
            $capa2.append('<option value="pwa">Arquitectura PWA</option>');
            $capa2.append('<option value="movil">Apps Móviles</option>');
        } else {
            $capa2.prop('disabled', true).html('<option value="">-- Primero elija el área --</option>');
            $('#resultadoFiltro').text('Seleccione las capas anteriores...');
        }

        registrarBitacora('FILTRO_CAPA1', 'Área seleccionada: ' + (valor || 'Ninguna'));
    });

    $(document).off('change', '#capa2').on('change', '#capa2', function() {
        var val = $(this).val();
        var seleccion = $(this).find('option:selected').text();

        if (val) {
            $('#resultadoFiltro').html('<strong>Elemento activo (Capa 3):</strong> ').append($('<span>').text(seleccion));
            registrarBitacora('FILTRO_CAPA2', 'Módulo seleccionado: ' + seleccion);
        } else {
            $('#resultadoFiltro').text('Seleccione las capas anteriores...');
        }
    });

    // 4. Filtrado de Proyectos del DOM (Base Semana 1 - Ej2 + Delegación)
    $(document).off('click', '.btn-filtro-dom').on('click', '.btn-filtro-dom', function() {
        var categoria = $(this).data('filter');
        $('.btn-filtro-dom').removeClass('active');
        $(this).addClass('active');

        $('#gridProyectos .tarjeta-item').each(function() {
            var catCard = $(this).data('categoria');
            if (categoria === 'todos' || catCard === categoria) {
                $(this).fadeIn(200);
            } else {
                $(this).fadeOut(150);
            }
        });

        registrarBitacora('DOM_FILTER', 'Categoría filtrada: ' + categoria);
    });

    // Delegación por Event Bubbling en tarjetas de proyectos
    $(document).off('click', '#gridProyectos .tarjeta-item').on('click', '#gridProyectos .tarjeta-item', function() {
        var titulo = $(this).find('h4').text();
        registrarBitacora('PROYECTO_CLICK', 'Tarjeta inspeccionada: ' + titulo);
    });

    // 5. Reacciones en vivo (Base Semana 1 Día 1: click / dblclick)
    $(document).off('click', '#btnLikePortafolio').on('click', '#btnLikePortafolio', function() {
        totalLikes++;
        $('#likeCounter').text(totalLikes);
        registrarBitacora('LIKE_PORTAFOLIO', 'Reacción positiva registrada (Total: ' + totalLikes + ')');
    });

    // 6. Validación Completa del Formulario + Cola Offline LocalStorage
    function guardarEnColaOffline(registro) {
        var cola = [];
        try {
            cola = JSON.parse(localStorage.getItem(CLAVE_COLA_OFFLINE)) || [];
        } catch (err) {
            cola = [];
        }
        cola.push(registro);
        localStorage.setItem(CLAVE_COLA_OFFLINE, JSON.stringify(cola));
    }

    function sincronizarColaOffline() {
        if (!navigator.onLine) return;
        var cola = [];
        try {
            cola = JSON.parse(localStorage.getItem(CLAVE_COLA_OFFLINE)) || [];
        } catch (err) {
            cola = [];
        }
        if (cola.length > 0) {
            localStorage.removeItem(CLAVE_COLA_OFFLINE);
            registrarBitacora('SYNC_OFFLINE', cola.length + ' mensaje(s) pendiente(s) sincronizado(s) con éxito');
            $('#offlineAlert').hide();
            $('#successAlert')
                .text('🟢 Conexión restaurada: ' + cola.length + ' mensaje(s) pendiente(s) sincronizado(s).')
                .slideDown()
                .delay(3500)
                .slideUp();
        }
    }

    $(document).off('submit', '#pwaForm').on('submit', '#pwaForm', function(e) {
        e.preventDefault();
        var valido = true;

        var nombre = $('#nombre').val().trim();
        var correo = $('#correo').val().trim();
        var mensaje = $('#mensaje').val().trim();

        if (nombre === '') {
            $('#errNombre').fadeIn();
            valido = false;
        } else {
            $('#errNombre').fadeOut();
        }

        var regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(correo)) {
            $('#errCorreo').fadeIn();
            valido = false;
        } else {
            $('#errCorreo').fadeOut();
        }

        if (mensaje === '') {
            $('#errMensaje').fadeIn();
            valido = false;
        } else {
            $('#errMensaje').fadeOut();
        }

        if (valido) {
            if (navigator.onLine) {
                $('#offlineAlert').hide();
                $('#successAlert')
                    .text('¡Mensaje validado y enviado correctamente! Nos pondremos en contacto pronto.')
                    .slideDown()
                    .delay(3500)
                    .slideUp();
                registrarBitacora('FORM_SUBMIT', 'Mensaje enviado en línea por ' + nombre);
            } else {
                guardarEnColaOffline({
                    nombre: nombre,
                    correo: correo,
                    mensaje: mensaje,
                    fecha: new Date().toISOString()
                });
                $('#successAlert').hide();
                $('#offlineAlert').slideDown().delay(4000).slideUp();
                registrarBitacora('FORM_OFFLINE_QUEUE', 'Mensaje de ' + nombre + ' guardado en cola local');
            }

            $('#pwaForm')[0].reset();
            $('#capa2').prop('disabled', true).html('<option value="">-- Primero elija el área --</option>');
            $('#resultadoFiltro').text('Seleccione las capas anteriores...');
        } else {
            registrarBitacora('FORM_ERROR', 'Validación incompleta en formulario de contacto');
        }
    });

    // 7. Detector Visual de Estado Offline / Online en jQuery
    function actualizarEstadoRed() {
        if (navigator.onLine) {
            $('#estadoRed').text('🟢 En Línea').css({
                background: '#dcfce7',
                color: '#166534'
            });
            registrarBitacora('ESTADO_RED', 'Conexión activa (En Línea)');
            sincronizarColaOffline();
        } else {
            $('#estadoRed').text('🟠 Modo Offline Activo (Datos Locales)').css({
                background: '#ffedd5',
                color: '#9a3412'
            });
            registrarBitacora('ESTADO_RED', 'Sin conexión — Modo Offline-First activo');
        }
    }

    $(window).off('online offline').on('online offline', actualizarEstadoRed);
    actualizarEstadoRed();
});
