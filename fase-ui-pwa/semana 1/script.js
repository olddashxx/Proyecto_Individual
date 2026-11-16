/* ==========================================================
   DEPORZONE WALLY PARK - LÓGICA DE INTERACCIÓN CON JQUERY (SEMANA 1)
   Materia: Diseño Web II (Ingeniería de Sistemas)
   Funcionalidades incluidas (exclusivamente Semana 1):
     1. Menú Hamburguesa (.slideToggle) + Modo Oscuro/Claro (.toggleClass)
     2. Filtrado multinivel (.fadeIn / .fadeOut) + Buscador keyup
     3. Acordeones por tarjeta (.slideToggle) + Reto PRO Jueves (Temática dinámica)
     4. Grilla de Horarios + Calculador de Tarifas con .animate()
     5. Bitácora de Eventos Día 1 (delegación, click, dblclick, keyup) y Día 2 (change, submit)
   ========================================================== */

$(document).ready(function () {

  // ==========================================================
  // SISTEMA DE BITÁCORA DE EVENTOS EN TIEMPO REAL (DÍA 1 Y DÍA 2)
  // ==========================================================
  let historialEventos = JSON.parse(localStorage.getItem('deporzone_logs') || '[]');
  let contadorFiltros = parseInt(localStorage.getItem('deporzone_filters') || '0', 10);
  let contadorReservas = parseInt(localStorage.getItem('deporzone_orders') || '0', 10);

  function registrarEventoBitacora(tipo, descripcion) {
    const hora = new Date().toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    historialEventos.unshift({
      timestamp: hora,
      tipo: tipo,
      mensaje: descripcion
    });

    historialEventos = historialEventos.slice(0, 40);
    localStorage.setItem('deporzone_logs', JSON.stringify(historialEventos));
    renderizarBitacora();
  }

  function renderizarBitacora() {
    const $lista = $('#activity-log-list');
    $lista.empty();

    $('#stat-total-events').text(historialEventos.length);
    $('#stat-filter-events').text(contadorFiltros);
    $('#stat-order-events').text(contadorReservas);

    if (historialEventos.length === 0) {
      const $vacio = $('<div>').addClass('log-entry').append(
        $('<span>').addClass('log-message').text('Bitácora vacía. Interactúa con el catálogo, buscador o formulario para registrar eventos.')
      );
      $lista.append($vacio);
      return;
    }

    historialEventos.forEach(function (item) {
      const $fila = $('<div>').addClass('log-entry');
      const $hora = $('<span>').addClass('log-timestamp').append(
        $('<i>').addClass('fa-regular fa-clock'),
        document.createTextNode(' ' + item.timestamp)
      );
      const $msg = $('<span>').addClass('log-message').text(item.mensaje);
      const $tag = $('<span>').addClass('log-type-tag').text(item.tipo);
      $fila.append($hora, $msg, $tag);
      $lista.append($fila);
    });
  }

  // Mostrar / Ocultar Bitácora con .fadeToggle()
  $('#toggle-log-btn').click(function () {
    $('#log-collapsible-box').fadeToggle(300);
    registrarEventoBitacora('UI_TOGGLE', 'Alternó visibilidad de la Bitácora con .fadeToggle()');
  });

  // Limpiar Historial de Bitácora
  $('#clear-log-btn').click(function () {
    historialEventos = [];
    contadorFiltros = 0;
    contadorReservas = 0;
    localStorage.removeItem('deporzone_logs');
    localStorage.setItem('deporzone_filters', '0');
    localStorage.setItem('deporzone_orders', '0');
    renderizarBitacora();
  });


  // ==========================================================
  // FUNCIÓN 1: MENÚ HAMBURGUESA (.slideToggle)
  // ==========================================================
  $('#hamburger-btn').click(function (e) {
    e.stopPropagation();
    $('#navbar').slideToggle(250);
    registrarEventoBitacora('NAV_CLICK', 'Desplegó / ocultó el menú hamburguesa (.slideToggle)');
  });

  $('.nav-link').click(function () {
    $('#navbar').slideUp(200);
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    registrarEventoBitacora('NAV_CLICK', 'Navegó a la sección: ' + $(this).text().trim());
  });

  $(document).click(function (e) {
    if (!$(e.target).closest('#main-header, #navbar').length) {
      $('#navbar').slideUp(200);
    }
  });


  // ==========================================================
  // FUNCIÓN 2: MODO OSCURO Y CLARO DINÁMICO
  // ==========================================================
  if (localStorage.getItem('deporzone_tema') === 'oscuro') {
    $('body').removeClass('theme-light').addClass('theme-dark');
    $('.icon-moon').hide();
    $('.icon-sun').show();
  }

  $('#theme-toggle-btn').click(function () {
    $('body').toggleClass('theme-dark');

    if ($('body').hasClass('theme-dark')) {
      $('.icon-moon').hide();
      $('.icon-sun').show().fadeIn(200);
      $(this).attr('title', 'Cambiar a modo claro');
      localStorage.setItem('deporzone_tema', 'oscuro');
      registrarEventoBitacora('TEMA_CLICK', 'Activó el Modo Oscuro (.theme-dark)');
    } else {
      $('.icon-sun').hide();
      $('.icon-moon').show().fadeIn(200);
      $(this).attr('title', 'Cambiar a modo oscuro');
      localStorage.setItem('deporzone_tema', 'claro');
      registrarEventoBitacora('TEMA_CLICK', 'Activó el Modo Claro (.theme-light)');
    }
  });


  // ==========================================================
  // FUNCIÓN 3: FILTRADO MULTINIVEL + BUSCADOR KEYUP + RETO PRO JUEVES
  // ==========================================================
  let filtroTipoActual = 'all';
  let filtroSubtipoActual = 'all';
  let filtroBusquedaActual = '';

  const configTematicaSuperficie = {
    'all': {
      clase: 'theme-surface-all',
      iconoHtml: '<i class="fa-solid fa-volleyball"></i>',
      filtroIconoHtml: '<i class="fa-solid fa-filter"></i>',
      etiqueta: 'Todas las superficies: 6 canchas bajo el mismo techo'
    },
    'madera': {
      clase: 'theme-surface-madera',
      iconoHtml: '<i class="fa-solid fa-border-all"></i>',
      filtroIconoHtml: '<i class="fa-solid fa-border-all"></i>',
      etiqueta: 'Temática Activa: Tabloncillo de Madera Flotante'
    },
    'sintetico': {
      clase: 'theme-surface-sintetico',
      iconoHtml: '<i class="fa-solid fa-grip"></i>',
      filtroIconoHtml: '<i class="fa-solid fa-grip"></i>',
      etiqueta: 'Temática Activa: Piso Sintético / Poliuretano'
    },
    'cemento-pulido': {
      clase: 'theme-surface-cemento',
      iconoHtml: '<i class="fa-solid fa-bolt-lightning"></i>',
      filtroIconoHtml: '<i class="fa-solid fa-square"></i>',
      etiqueta: 'Temática Activa: Cemento Alisado de Alta Velocidad'
    }
  };

  function aplicarTematicaDinamica(tipoSuperficie) {
    const cfg = configTematicaSuperficie[tipoSuperficie] || configTematicaSuperficie.all;
    const clasesTematicas = 'theme-surface-all theme-surface-madera theme-surface-sintetico theme-surface-cemento';

    $('#hero-section, #filter-section').removeClass(clasesTematicas).addClass(cfg.clase);
    $('#hero-main-icon').html(cfg.iconoHtml);
    $('#filter-main-icon').html(cfg.filtroIconoHtml);
    $('#hero-surface-label').text(cfg.etiqueta);
  }

  // 3.1 Clic en botones de Tipo de Superficie (Filtro + Reto PRO Jueves)
  $('.type-btn').click(function () {
    $('.type-btn').removeClass('active');
    $(this).addClass('active');

    filtroTipoActual = $(this).data('type');
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));

    aplicarTematicaDinamica(filtroTipoActual);
    registrarEventoBitacora('FILTRO_SUPERFICIE', 'Filtró superficie y actualizó temática: ' + $(this).text().trim());
    aplicarFiltros();
  });

  // 3.2 Clic en botones de Subtipo de Ambiente
  $('.subtype-btn').click(function () {
    $('.subtype-btn').removeClass('active');
    $(this).addClass('active');

    filtroSubtipoActual = $(this).data('subtype');
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));

    registrarEventoBitacora('FILTRO_AMBIENTE', 'Filtró ambiente: ' + $(this).text().trim());
    aplicarFiltros();
  });

  // 3.3 Buscador en tiempo real con evento keyup (Día 1 + Layout Visual jQuery)
  $('#searchCancha').on('keyup', function () {
    const texto = $(this).val().trim();
    filtroBusquedaActual = texto.toLowerCase();
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));
    aplicarFiltros();
    registrarEventoBitacora('BUSQUEDA_KEYUP', 'Tecleando en buscador: "' + texto + '"');
  });

  // 3.4 Evaluar tipo, subtipo y búsqueda con .fadeIn() / .fadeOut()
  function aplicarFiltros() {
    $('.court-card').each(function () {
      const cardTipo = $(this).data('type');
      const cardSubtipos = $(this).data('subtype') ? $(this).data('subtype').split(' ') : [];
      const contenidoTexto = $(this).text().toLowerCase();

      const coincideTipo = (filtroTipoActual === 'all') || (cardTipo === filtroTipoActual);
      const coincideSubtipo = (filtroSubtipoActual === 'all') || cardSubtipos.includes(filtroSubtipoActual);
      const coincideTexto = !filtroBusquedaActual || contenidoTexto.indexOf(filtroBusquedaActual) !== -1;

      if (coincideTipo && coincideSubtipo && coincideTexto) {
        $(this).fadeIn(250);
      } else {
        $(this).fadeOut(250);
      }
    });
  }

  // 3.5 Delegación de Eventos (Event Bubbling - Día 1) sobre #courts-container
  $('#courts-container').on('click', function (e) {
    const $target = $(e.target);

    // A. Acordeón de Detalles Técnicos por Tarjeta (Guía Jueves: .slideToggle('fast'))
    const $btnAcordeon = $target.closest('.accordion-btn');
    if ($btnAcordeon.length) {
      const $card = $btnAcordeon.closest('.court-card');
      const nombreCancha = $card.data('court-label') || 'Cancha';
      $btnAcordeon.next('.accordion-panel').slideToggle('fast');
      registrarEventoBitacora('ACORDEON_DETALLES', 'Alternó detalles del servicio en ' + nombreCancha);
      return;
    }

    // B. Botón Me Gusta / Like en Tarjeta (Día 1)
    const $btnLike = $target.closest('.btn-like-court');
    if ($btnLike.length) {
      const $contador = $btnLike.find('.like-count');
      const likesActuales = parseInt($contador.text(), 10) || 0;
      $contador.text(likesActuales + 1);
      $btnLike.closest('.court-card').addClass('court-liked');
      const nombreCancha = $btnLike.data('court-name') || 'Cancha';
      registrarEventoBitacora('LIKE_CANCHA', '¡El usuario envió un ❤️ a ' + nombreCancha + '!');
      return;
    }

    // C. Botón Seleccionar Cancha hacia Reserva
    const $btnSeleccionar = $target.closest('.btn-select-court');
    if ($btnSeleccionar.length) {
      const courtId = $btnSeleccionar.data('court-id');
      const courtName = $btnSeleccionar.data('court-name');

      $('#select-cancha-reserva').val(courtId).trigger('change');
      registrarEventoBitacora('OFERTA_CLICK', 'Seleccionó desde catálogo: ' + courtName);

      $('html, body').animate({
        scrollTop: $('#booking-section').offset().top - 80
      }, 500);
    }
  });

  // Evento dblclick delegado en tarjetas de canchas para Likes rápidos (Día 1)
  $('#courts-container').on('dblclick', '.court-card', function (e) {
    if ($(e.target).closest('button').length) return;
    const $btnLike = $(this).find('.btn-like-court');
    const $contador = $btnLike.find('.like-count');
    const likesActuales = parseInt($contador.text(), 10) || 0;
    $contador.text(likesActuales + 1);
    $(this).addClass('court-liked');
    const nombreCancha = $(this).data('court-label') || 'Cancha';
    registrarEventoBitacora('LIKE_DBLCLICK', 'Doble clic: ❤️ Me Gusta en ' + nombreCancha);
  });

  // 3.6 Pestaña Acordeón Principal del Catálogo (.slideToggle)
  $('#toggle-catalog-btn').click(function () {
    const $btn = $(this);
    const $wrapper = $('#catalog-collapsible-wrapper');

    $wrapper.slideToggle(350, function () {
      if ($wrapper.is(':visible')) {
        $btn.removeClass('collapsed').attr('aria-expanded', 'true');
        $btn.find('.toggle-text').empty().append(
          $('<i>').addClass('fa-solid fa-eye-slash'),
          document.createTextNode(' Ocultar Catálogo de Canchas')
        );
        registrarEventoBitacora('UI_ACORDEON', 'Desplegó el catálogo de canchas (.slideToggle)');
      } else {
        $btn.addClass('collapsed').attr('aria-expanded', 'false');
        $btn.find('.toggle-text').empty().append(
          $('<i>').addClass('fa-solid fa-eye'),
          document.createTextNode(' Ver / Mostrar Catálogo de Canchas')
        );
        registrarEventoBitacora('UI_ACORDEON', 'Ocultó el catálogo de canchas (.slideToggle)');
      }
    });
  });


  // ==========================================================
  // FUNCIÓN 4: GRILLA DE HORARIOS, CALCULADOR Y VALIDACIÓN (DÍA 2)
  // ==========================================================
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const fechaHoyFormato = `${yyyy}-${mm}-${dd}`;

  $('#fecha-reserva').attr('min', fechaHoyFormato).val(fechaHoyFormato);

  let precioPorHora = 80;
  let horaInicio = 19;
  let horaFin = 20;
  let horasValidas = true;

  const turnosOcupados = [
    { inicio: 16, fin: 17 },
    { inicio: 20, fin: 21 }
  ];

  // 4.1 Clic en botones de Turnos Rápidos (.btn-slot)
  $('.btn-slot').click(function () {
    if ($(this).hasClass('ocupado')) {
      const hIni = $(this).data('inicio');
      const hF = $(this).data('fin');
      mostrarAlertaError(`⛔ El turno de las ${hIni}:00 a ${hF}:00 ya se encuentra reservado. Elige otro horario disponible.`);
      registrarEventoBitacora('TURNO_OCUPADO', `Intentó seleccionar turno ocupado (${hIni}:00 a ${hF}:00)`);
      return;
    }

    $('.btn-slot:not(.ocupado)').removeClass('active-slot');
    $(this).addClass('active-slot');

    horaInicio = parseInt($(this).data('inicio'), 10);
    horaFin = parseInt($(this).data('fin'), 10);

    $('#select-inicio').val(horaInicio);
    $('#select-fin').val(horaFin);

    registrarEventoBitacora('TURNO_CLICK', `Seleccionó turno rápido ${horaInicio}:00 a ${horaFin}:00`);
    validarHorarios();
    calcularTotalReserva(true);
    verificarEstadoVisualFormulario();
  });

  // 4.2 Cambio en selectores de Hora Inicio y Fin (Evento change - Día 2)
  $('#select-inicio, #select-fin').on('change', function () {
    horaInicio = parseInt($('#select-inicio').val(), 10);
    horaFin = parseInt($('#select-fin').val(), 10);

    validarHorarios();
    calcularTotalReserva(true);
    verificarEstadoVisualFormulario();
    registrarEventoBitacora('CAMBIO_HORARIO', `Horario actualizado a ${horaInicio}:00 - ${horaFin}:00`);
  });

  function validarHorarios() {
    $('#select-inicio, #select-fin').removeClass('input-invalid input-valid');
    $('#err-hours').hide().text('');
    horasValidas = false;

    if (horaFin <= horaInicio) {
      $('#err-hours').text('⚠️ La hora de fin debe ser posterior a la de inicio (mínimo 1 hora de juego).').slideDown('fast');
      $('#select-inicio, #select-fin').addClass('input-invalid');
      $('.btn-slot').removeClass('active-slot');
      mostrarAlertaError('⚠️ Horario no válido: la hora fin debe ser mayor a la hora de inicio.');
      return false;
    }

    let tieneTurnoOcupado = false;
    let turnoChocado = '';
    for (const t of turnosOcupados) {
      if (Math.max(horaInicio, t.inicio) < Math.min(horaFin, t.fin)) {
        tieneTurnoOcupado = true;
        turnoChocado = `${t.inicio}:00 a ${t.fin}:00`;
        break;
      }
    }

    if (tieneTurnoOcupado) {
      $('#err-hours').text(`⛔ Tu selección abarca el horario ${turnoChocado}, el cual ya está ocupado.`).slideDown('fast');
      $('#select-inicio, #select-fin').addClass('input-invalid');
      $('.btn-slot').removeClass('active-slot');
      mostrarAlertaError(`⛔ El rango seleccionado incluye turnos ocupados (${turnoChocado}). Elige horas libres.`);
      return false;
    }

    horasValidas = true;
    $('#select-inicio, #select-fin').addClass('input-valid');
    $('#err-hours').slideUp('fast');
    $('#booking-alert-error').slideUp('fast');

    $('.btn-slot').removeClass('active-slot');
    if (horaFin - horaInicio === 1) {
      $(`.btn-slot[data-inicio="${horaInicio}"][data-fin="${horaFin}"]:not(.ocupado)`).addClass('active-slot');
    }

    return true;
  }

  // 4.3 Eventos change en selectores de Cancha, Modalidad, Forma de Pago y Adicionales (Día 2)
  $('#select-cancha-reserva').change(function () {
    const optSeleccionada = $(this).find('option:selected');
    precioPorHora = parseInt(optSeleccionada.data('precio'), 10) || 80;

    const nombreCancha = optSeleccionada.text().split('(')[0].trim();
    $('#summary-court').text(nombreCancha);

    calcularTotalReserva(true);
    registrarEventoBitacora('CAMBIO_VARIANTE', 'Cancha seleccionada: ' + optSeleccionada.text().trim());
  });

  $('#wally-category').change(function () {
    const texto = $(this).find('option:selected').text();
    registrarEventoBitacora('CAMBIO_VARIANTE', 'Modalidad de juego: ' + texto);
  });

  $('#payment-method').change(function () {
    const texto = $(this).find('option:selected').text();
    registrarEventoBitacora('CAMBIO_VARIANTE', 'Forma de pago elegida: ' + texto);
  });

  $('input[name="add-ball"], input[name="add-vests"], input[name="add-water"]').change(function () {
    const etiqueta = $(this).parent().text().trim();
    const estado = $(this).is(':checked') ? 'Agregó' : 'Quitó';
    calcularTotalReserva(true);
    registrarEventoBitacora('CAMBIO_ADICIONAL', `${estado} adicional: ${etiqueta}`);
  });

  // 4.4 Calculador de tarifa y animación .animate() en #summary-total
  function calcularTotalReserva(animar) {
    const totalHoras = horaFin - horaInicio;

    if (!horasValidas || totalHoras <= 0) {
      $('#summary-hours').text('0 Horas (Horario inválido)');
      $('#summary-time').text('No asignado');
      $('#summary-total').text('0 BOB').css('color', '#e53935');
      return;
    }

    const subtotalCancha = totalHoras * precioPorHora;
    let totalAdicionales = 0;
    if ($('#add-ball').is(':checked')) totalAdicionales += parseInt($('#add-ball').val(), 10);
    if ($('#add-vests').is(':checked')) totalAdicionales += parseInt($('#add-vests').val(), 10);
    if ($('#add-water').is(':checked')) totalAdicionales += parseInt($('#add-water').val(), 10);

    const granTotal = subtotalCancha + totalAdicionales;

    $('#summary-hours').text(`${totalHoras} Hora(s)`);
    $('#summary-time').text(`${horaInicio}:00 a ${horaFin}:00`);
    $('#summary-total').text(`${granTotal} BOB`).css('color', '#27ae60');

    if (animar) {
      $('#summary-total')
        .stop(true, true)
        .animate({ fontSize: '1.45rem' }, 120)
        .animate({ fontSize: '1.25rem' }, 120);
    }
  }

  function mostrarAlertaError(mensaje) {
    $('#booking-alert-success').hide();
    $('#booking-alert-error').text(mensaje).slideDown('fast');
  }


  // ==========================================================
  // VALIDACIÓN DE CAMPOS EN TIEMPO REAL Y SUBMIT (DÍA 2 + DOM)
  // ==========================================================
  function validarCampoFecha() {
    const valorFecha = $('#fecha-reserva').val();
    $('#fecha-reserva').removeClass('input-invalid input-valid');
    $('#err-date').hide().text('');

    if (!valorFecha) {
      $('#err-date').text('⚠️ Debes seleccionar una fecha para la reserva.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    if (valorFecha < fechaHoyFormato) {
      $('#err-date').text('⚠️ No puedes reservar en una fecha pasada. Elige hoy o un día posterior.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    $('#fecha-reserva').addClass('input-valid');
    return true;
  }

  function validarCampoNombre() {
    const nombre = $('#client-name').val().trim();
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;

    $('#client-name').removeClass('input-invalid input-valid');
    $('#err-name').hide().text('');

    if (nombre === '') {
      $('#err-name').text('⚠️ El nombre completo es obligatorio.').slideDown('fast');
      $('#client-name').addClass('input-invalid');
      return false;
    }

    if (!regexNombre.test(nombre)) {
      $('#err-name').text('⚠️ Ingresa un nombre válido (al menos 3 letras, sin números ni símbolos).').slideDown('fast');
      $('#client-name').addClass('input-invalid');
      return false;
    }

    $('#client-name').addClass('input-valid');
    return true;
  }

  function validarCampoTelefono() {
    const tel = $('#client-phone').val().trim();
    const regexTel = /^[0-9]{7,10}$/;

    $('#client-phone').removeClass('input-invalid input-valid');
    $('#err-phone').hide().text('');

    if (tel === '') {
      $('#err-phone').text('⚠️ El número de celular / WhatsApp es obligatorio.').slideDown('fast');
      $('#client-phone').addClass('input-invalid');
      return false;
    }

    if (!regexTel.test(tel)) {
      $('#err-phone').text('⚠️ Ingresa un número válido de 7 a 10 dígitos numéricos (ej: 78854844).').slideDown('fast');
      $('#client-phone').addClass('input-invalid');
      return false;
    }

    $('#client-phone').addClass('input-valid');
    return true;
  }

  function validarCampoEmail() {
    const correo = $('#client-email').val().trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    $('#client-email').removeClass('input-invalid input-valid');
    $('#err-email').hide().text('');

    if (correo === '') {
      $('#err-email').text('⚠️ El correo electrónico es obligatorio.').slideDown('fast');
      $('#client-email').addClass('input-invalid');
      return false;
    }

    if (!regexEmail.test(correo)) {
      $('#err-email').text('⚠️ Ingresa un formato de correo válido (ej: usuario@correo.com).').slideDown('fast');
      $('#client-email').addClass('input-invalid');
      return false;
    }

    $('#client-email').addClass('input-valid');
    return true;
  }

  function verificarEstadoVisualFormulario() {
    const f = $('#fecha-reserva').val();
    const fechaOk = Boolean(f && f >= fechaHoyFormato);
    const nombreOk = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test($('#client-name').val().trim());
    const telOk = /^[0-9]{7,10}$/.test($('#client-phone').val().trim());
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#client-email').val().trim());
    const todoValido = fechaOk && horasValidas && nombreOk && telOk && emailOk;

    const $btn = $('#btn-submit-booking');
    if (todoValido) {
      $btn.removeClass('btn-pending').addClass('btn-ready');
    } else {
      $btn.removeClass('btn-ready').addClass('btn-pending');
    }
    return todoValido;
  }

  $('#fecha-reserva').on('change blur', function () {
    validarCampoFecha();
    verificarEstadoVisualFormulario();
    registrarEventoBitacora('CAMBIO_FECHA', 'Fecha seleccionada: ' + ($(this).val() || 'vacía'));
  });

  $('#client-name').on('blur input', function () {
    validarCampoNombre();
    verificarEstadoVisualFormulario();
  });

  $('#client-phone').on('blur input', function () {
    validarCampoTelefono();
    verificarEstadoVisualFormulario();
  });

  $('#client-email').on('blur input', function () {
    validarCampoEmail();
    verificarEstadoVisualFormulario();
  });

  // Evento submit del formulario con e.preventDefault() (Día 2 + DOM Ejemplo 4)
  $('#reservation-form').submit(function (e) {
    e.preventDefault();

    const vFecha = validarCampoFecha();
    const vHoras = validarHorarios();
    const vNombre = validarCampoNombre();
    const vTel = validarCampoTelefono();
    const vEmail = validarCampoEmail();

    if (!vFecha || !vHoras || !vNombre || !vTel || !vEmail) {
      mostrarAlertaError('⚠️ Revisa los campos resaltados en rojo antes de confirmar la reserva.');
      verificarEstadoVisualFormulario();
      registrarEventoBitacora('VALIDACION_ERROR', 'Intento de envío con campos inválidos o incompletos');
      return;
    }

    const nombreCliente = $('#client-name').val().trim();
    const cancha = $('#summary-court').text();
    const horario = $('#summary-time').text();
    const fecha = $('#fecha-reserva').val();
    const modalidad = $('#wally-category option:selected').text();
    const pago = $('#payment-method option:selected').text();
    const total = $('#summary-total').text();

    contadorReservas++;
    localStorage.setItem('deporzone_orders', String(contadorReservas));

    $('#booking-alert-error').hide();
    const $alerta = $('#booking-alert-success').empty();
    $alerta.append(
      $('<strong>').text('✅ ¡Reserva Confirmada en DeporZone Wally Park!'),
      $('<br>'),
      document.createTextNode(`Titular: ${nombreCliente} | Cancha: ${cancha}`),
      $('<br>'),
      document.createTextNode(`Fecha y Turno: ${fecha} (${horario}) | Modalidad: ${modalidad}`),
      $('<br>'),
      document.createTextNode(`Pago: ${pago} | Total: `),
      $('<strong>').text(total)
    ).slideDown(300);

    registrarEventoBitacora(
      'RESERVA_EXITOSA',
      `Pedido confirmado para ${nombreCliente} — ${cancha} (${fecha} ${horario}) • ${total}`
    );

    // Reiniciar campos manteniendo valores por defecto de fecha y turno
    $('#client-name, #client-phone, #client-email, #client-notes').val('');
    $('input[name="add-ball"], input[name="add-vests"], input[name="add-water"]').prop('checked', false);
    $('input, select').removeClass('input-valid input-invalid');
    calcularTotalReserva(false);
    verificarEstadoVisualFormulario();
  });


  // ==========================================================
  // FUNCIÓN 5: REDES SOCIALES (.fadeToggle Y REGISTRO EN BITÁCORA)
  // ==========================================================
  $('#toggle-social-btn').click(function () {
    $('#social-collapsible-box').fadeToggle(300);
    registrarEventoBitacora('UI_TOGGLE', 'Alternó visibilidad de Redes Sociales (.fadeToggle)');
  });

  $('.social-card').click(function () {
    const redNombre = $(this).data('network');
    registrarEventoBitacora('SOCIAL_CLICK', 'Abrió red social oficial: ' + redNombre);
  });


  // ==========================================================
  // INICIALIZACIÓN DE PANTALLA (SIN DUPLICAR LOGS PREVIOS)
  // ==========================================================
  const optInicial = $('#select-cancha-reserva').find('option:selected');
  precioPorHora = parseInt(optInicial.data('precio'), 10) || 80;
  $('#summary-court').text(optInicial.text().split('(')[0].trim());

  validarHorarios();
  calcularTotalReserva(false);
  verificarEstadoVisualFormulario();
  renderizarBitacora();
  registrarEventoBitacora('SISTEMA', 'Sesión iniciada en DeporZone Wally Park (Semana 1)');

});
