/* ==========================================================
   DEPORZONE WALLY PARK - LÓGICA COMPLETA (SEMANAS 1, 2 Y 3)
   Materia: Diseño Web II (Ingeniería de Sistemas)
   Funcionalidades incluidas:
     - Semana 1: Menú hamburguesa, Modo oscuro, Temática dinámica por superficie,
       acordeones .slideToggle, delegación click/dblclick/keyup, change y submit
     - Semana 2: Service Worker PWA Offline-First, Fetch manifest.json, Estado Red,
       Detección Móvil (mobile.html), Hidratación SSR, Modal 30s y Toast Alert
     - Semana 3: Tree Shaking, Prevención de fugas (.off().on()), Seguridad Anti-XSS (.text()),
       Módulo #formReserva (.modulo-reservas) y Cola Blindada (.cola-karaoke) + Teclado virtual
   ========================================================== */

// ==========================================================
// [PWA 1]: REGISTRO DE SERVICE WORKER OFFLINE-FIRST (sw.js)
// ==========================================================
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => {
        console.log('[PWA DeporZone] Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA DeporZone] Service Worker omitido:', err);
      });
  });
}

// ==========================================================
// [PWA 2]: DETECCIÓN DE DISPOSITIVO MÓVIL -> BANNER VISTA CELULAR
// ==========================================================
function detectarDispositivoMovil() {
  const esMovil =
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const banner = document.getElementById('bannerDeteccionMovil');
  if (banner) {
    banner.classList.toggle('visible', esMovil);
  }
}

window.addEventListener('resize', detectarDispositivoMovil);
detectarDispositivoMovil();

$(document).ready(function () {

  // ==========================================================
  // [SEMANA 3 - UI CRÍTICA #1]: PROTECCIÓN DE TECLADO VIRTUAL EN MÓVIL
  // ==========================================================
  if (document.body.classList.contains('vista-mobile')) {
    $(document)
      .off('focusin.teclado focusout.teclado')
      .on('focusin.teclado', 'input, textarea, select', function () {
        if (window.innerWidth <= 1024) {
          $('body').addClass('keyboard-open');
        }
      })
      .on('focusout.teclado', 'input, textarea, select', function () {
        setTimeout(function () {
          if (!$(document.activeElement).is('input, textarea, select')) {
            $('body').removeClass('keyboard-open');
          }
        }, 120);
      });
  }

  // ==========================================================
  // [PWA 3]: CONSULTA FETCH ASÍNCRONA DE MANIFIESTO (response.ok + catch)
  // ==========================================================
  if (window.location.protocol !== 'file:') {
    fetch('manifest.json')
      .then((response) => {
        if (!response.ok) throw new Error('Error al leer manifest.json');
        return response.json();
      })
      .then((manifest) => {
        console.log('[PWA DeporZone] Manifest verificado:', manifest.short_name);
      })
      .catch((err) => {
        console.warn('[PWA DeporZone] Lectura de manifest en modo local:', err.message);
      });
  }

  // ==========================================================
  // [PWA 4]: HIDRATACIÓN SSR TRANSPARENTE EN CADA <button> (.off().on())
  // ==========================================================
  function hidratarBotonesDOM(raiz) {
    const $contenedor = $('#contenedorMenu');
    if ($contenedor.length && $contenedor.attr('data-hidratado') !== 'true') {
      $contenedor.attr('data-hidratado', 'true');
    }

    $(raiz)
      .find('button')
      .each(function () {
        const $btn = $(this);
        if ($btn.attr('data-hidratado') === 'true') return;

        $btn
          .attr('data-hidratado', 'true')
          .off('click.deporzoneHidratacion')
          .on('click.deporzoneHidratacion', function () {
            $(this).attr('data-ultimo-evento', 'hidratado');
          });
      });
  }

  setTimeout(function () {
    hidratarBotonesDOM(document);
  }, 150);

  // ==========================================================
  // SISTEMA DE BITÁCORA DE EVENTOS CON TIMESTAMP (ANTI-XSS .text())
  // ==========================================================
  let historialEventos = JSON.parse(localStorage.getItem('deporzone_logs') || '[]');
  let contadorFiltros = parseInt(localStorage.getItem('deporzone_filters') || '0', 10);
  let contadorReservas = parseInt(localStorage.getItem('deporzone_orders') || '0', 10);

  function registrarEventoTimestamp(tipo, descripcion) {
    const ahoraLog = new Date();
    const fechaHora = ahoraLog.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    historialEventos.unshift({
      timestamp: fechaHora,
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
        $('<span>').addClass('log-message').text('Bitácora vacía. Interactúa con el catálogo o formulario para registrar eventos.')
      );
      $lista.append($vacio);
      return;
    }

    historialEventos.forEach(function (item) {
      // Construcción segura Anti-XSS usando .text() en vez de concatenar HTML
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

  $('#toggle-log-btn').off('click').on('click', function () {
    $('#log-collapsible-box').fadeToggle(300);
    registrarEventoTimestamp('UI', 'Alternó visibilidad de la Bitácora con .fadeToggle()');
  });

  $('#clear-log-btn').off('click').on('click', function () {
    historialEventos = [];
    contadorFiltros = 0;
    contadorReservas = 0;
    localStorage.removeItem('deporzone_logs');
    localStorage.setItem('deporzone_filters', '0');
    localStorage.setItem('deporzone_orders', '0');
    renderizarBitacora();
    mostrarToastAlert('🧹 Bitácora Reiniciada', 'El historial de eventos con Timestamp fue limpiado correctamente.', false);
  });


  // ==========================================================
  // FUNCIÓN 1: MENÚ HAMBURGUESA Y NAVEGACIÓN MÓVIL SIN SCROLL
  // ==========================================================
  function cambiarTabMovil(tabId) {
    if (!tabId) return;
    $('.mobile-tab-panel').removeClass('active');
    $('#' + tabId).addClass('active');
    $('.btn-nav-tab').removeClass('active');
    $('.btn-nav-tab[data-tab="' + tabId + '"]').addClass('active');
  }

  function activarSubpanelMovil($panelPadre, subpanelId) {
    if (!$panelPadre || !$panelPadre.length || !subpanelId) return;
    $panelPadre.find('.mobile-subpanel').removeClass('active');
    $panelPadre.find('#' + subpanelId).addClass('active');
    $panelPadre.find('.btn-subtab').removeClass('active');
    $panelPadre.find('.btn-subtab[data-subtab="' + subpanelId + '"]').addClass('active');
  }

  $('.btn-nav-tab, .btn-go-tab').off('click').on('click', function () {
    const targetTab = $(this).data('tab');
    cambiarTabMovil(targetTab);
  });

  $('.btn-subtab').off('click').on('click', function () {
    const subpanelId = $(this).data('subtab');
    const $panelPadre = $(this).closest('.mobile-tab-panel');
    activarSubpanelMovil($panelPadre, subpanelId);
  });

  $('#hamburger-btn').off('click').on('click', function (e) {
    e.stopPropagation();
    $('#navbar').slideToggle(250);
    registrarEventoTimestamp('NAV', 'Desplegó / ocultó el menú hamburguesa (.slideToggle)');
  });

  $('.nav-link').off('click').on('click', function (e) {
    const targetTab = $(this).data('tab');
    if (targetTab && document.body.classList.contains('vista-mobile')) {
      e.preventDefault();
      cambiarTabMovil(targetTab);
    }
    $('#navbar').slideUp(200);
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    registrarEventoTimestamp('NAV', 'Navegó a la sección: ' + $(this).text().trim());
  });

  $(document).off('click.menuFuera').on('click.menuFuera', function (e) {
    if (!$(e.target).closest('#main-header, #navbar').length) {
      $('#navbar').slideUp(200);
    }
  });


  // ==========================================================
  // FUNCIÓN 2: MODO OSCURO Y CLARO PERSISTENTE EN LOCALSTORAGE
  // ==========================================================
  if (localStorage.getItem('deporzone_tema') === 'oscuro') {
    $('body').removeClass('theme-light').addClass('theme-dark');
    $('.icon-moon').hide();
    $('.icon-sun').show();
  }

  $('#theme-toggle-btn').off('click').on('click', function () {
    $('body').toggleClass('theme-dark');

    if ($('body').hasClass('theme-dark')) {
      $('.icon-moon').hide();
      $('.icon-sun').show().fadeIn(200);
      $(this).attr('title', 'Cambiar a modo claro');
      localStorage.setItem('deporzone_tema', 'oscuro');
      registrarEventoTimestamp('TEMA', 'Activó el Modo Oscuro (.theme-dark)');
    } else {
      $('.icon-sun').hide();
      $('.icon-moon').show().fadeIn(200);
      $(this).attr('title', 'Cambiar a modo oscuro');
      localStorage.setItem('deporzone_tema', 'claro');
      registrarEventoTimestamp('TEMA', 'Activó el Modo Claro (.theme-light)');
    }
  });


  // ==========================================================
  // FUNCIÓN 3: FILTRADO MULTINIVEL, TEMÁTICA DINÁMICA, ACORDEÓN Y DELEGACIÓN
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

  $('.type-btn').off('click').on('click', function () {
    $('.type-btn').removeClass('active');
    $(this).addClass('active');

    filtroTipoActual = $(this).data('type');
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));
    aplicarTematicaDinamica(filtroTipoActual);
    registrarEventoTimestamp('FILTRO', 'Filtró superficie: ' + $(this).text().trim());
    aplicarFiltros();
  });

  $('.subtype-btn').off('click').on('click', function () {
    $('.subtype-btn').removeClass('active');
    $(this).addClass('active');

    filtroSubtipoActual = $(this).data('subtype');
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', 'Filtró ambiente: ' + $(this).text().trim());
    aplicarFiltros();
  });

  $('#searchCancha').off('keyup').on('keyup', function () {
    filtroBusquedaActual = $(this).val().trim().toLowerCase();
    aplicarFiltros();
  });

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

  // Delegación de eventos sobre #courts-container (Event Bubbling + prevención Memory Leaks)
  $('#courts-container')
    .off('click.catalogo')
    .on('click.catalogo', '.accordion-btn', function () {
      const nombreCancha = $(this).closest('.court-card').data('court-label') || 'Cancha';
      $(this).next('.accordion-panel').slideToggle('fast');
      registrarEventoTimestamp('UI', 'Alternó detalles del servicio en ' + nombreCancha);
    })
    .on('click.catalogo', '.btn-like-court', function () {
      const $contador = $(this).find('.like-count');
      const likesActuales = parseInt($contador.text(), 10) || 0;
      $contador.text(likesActuales + 1);
      $(this).closest('.court-card').addClass('court-liked');
      const nombreCancha = $(this).data('court-name') || 'Cancha';
      registrarEventoTimestamp('LIKE', '¡El usuario envió un ❤️ a ' + nombreCancha + '!');
    })
    .on('click.catalogo', '.btn-select-court', function () {
      const courtId = $(this).data('court-id');
      const courtName = $(this).data('court-name');

      $('#select-cancha-reserva').val(courtId).trigger('change');
      registrarEventoTimestamp('CANCHA', 'Seleccionó desde catálogo: ' + courtName);

      if (document.body.classList.contains('vista-mobile')) {
        cambiarTabMovil('tab-reservar');
        activarSubpanelMovil($('#tab-reservar'), 'sub-horarios');
      } else {
        $('html, body').animate({
          scrollTop: $('#booking-section').offset().top - 80
        }, 500);
      }
    })
    .off('dblclick.catalogo')
    .on('dblclick.catalogo', '.court-card', function (e) {
      if ($(e.target).closest('button').length) return;
      const $btnLike = $(this).find('.btn-like-court');
      if ($btnLike.length) {
        const $contador = $btnLike.find('.like-count');
        const likesActuales = parseInt($contador.text(), 10) || 0;
        $contador.text(likesActuales + 1);
      }
      $(this).addClass('court-liked');
      const nombreCancha = $(this).data('court-label') || 'Cancha';
      registrarEventoTimestamp('LIKE_DBLCLICK', 'Doble clic: ❤️ Me Gusta en ' + nombreCancha);
    });

  $('#btn-ir-titular').off('click').on('click', function () {
    const fechaOk = validarCampoFecha();
    const horasOk = validarHorarios();
    if (fechaOk && horasOk) {
      activarSubpanelMovil($('#tab-reservar'), 'sub-titular');
    }
  });

  $('#toggle-catalog-btn').off('click').on('click', function () {
    const $btn = $(this);
    const $wrapper = $('#catalog-collapsible-wrapper');

    $wrapper.slideToggle(350, function () {
      if ($wrapper.is(':visible')) {
        $btn.removeClass('collapsed').attr('aria-expanded', 'true');
        $btn.find('.toggle-text').empty().append(
          $('<i>').addClass('fa-solid fa-eye-slash'),
          document.createTextNode(' Ocultar Catálogo de Canchas')
        );
        registrarEventoTimestamp('UI', 'Desplegó el catálogo de canchas (.slideToggle)');
      } else {
        $btn.addClass('collapsed').attr('aria-expanded', 'false');
        $btn.find('.toggle-text').empty().append(
          $('<i>').addClass('fa-solid fa-eye'),
          document.createTextNode(' Ver / Mostrar Catálogo de Canchas')
        );
        registrarEventoTimestamp('UI', 'Ocultó el catálogo de canchas (.slideToggle)');
      }
    });
  });


  // ==========================================================
  // FUNCIÓN 4: FORMULARIO DE RESERVA, VALIDACIONES Y CÁLCULO
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

  $('.btn-slot').off('click').on('click', function () {
    if ($(this).hasClass('ocupado')) {
      const hIni = $(this).data('inicio');
      const hF = $(this).data('fin');
      mostrarAlertaError(`⛔ El turno de las ${hIni}:00 a ${hF}:00 ya se encuentra reservado. Elige otro horario disponible.`);
      registrarEventoTimestamp('ALERTA', `Intentó seleccionar turno ocupado (${hIni}:00 a ${hF}:00)`);
      return;
    }

    $('.btn-slot:not(.ocupado)').removeClass('active-slot');
    $(this).addClass('active-slot');

    horaInicio = parseInt($(this).data('inicio'), 10);
    horaFin = parseInt($(this).data('fin'), 10);

    $('#select-inicio').val(horaInicio);
    $('#select-fin').val(horaFin);

    registrarEventoTimestamp('TURNO', `Seleccionó turno rápido ${horaInicio}:00 a ${horaFin}:00`);
    validarHorarios();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  $('#select-inicio, #select-fin').off('change blur').on('change blur', function () {
    horaInicio = parseInt($('#select-inicio').val(), 10);
    horaFin = parseInt($('#select-fin').val(), 10);

    validarHorarios();
    calcularTotalReserva();
    verificarFormularioCompleto();
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

  $('#select-cancha-reserva').off('change').on('change', function () {
    const optSeleccionada = $(this).find('option:selected');
    precioPorHora = parseInt(optSeleccionada.data('precio'), 10) || 80;

    const nombreCancha = optSeleccionada.text().split('(')[0].trim();
    $('#summary-court').text(nombreCancha);

    calcularTotalReserva();
  });

  $('input[name="add-ball"], input[name="add-vests"], input[name="add-water"]').off('change').on('change', function () {
    calcularTotalReserva();
  });

  function calcularTotalReserva() {
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

    if (document.body.classList.contains('vista-mobile')) {
      $('#summary-total')
        .text(`${granTotal} BOB`)
        .css('color', '#27ae60')
        .stop(true, true)
        .animate({ opacity: 0.5 }, 120)
        .animate({ opacity: 1 }, 120);
    } else {
      $('#summary-total')
        .text(`${granTotal} BOB`)
        .css('color', '#27ae60')
        .stop(true, true)
        .animate({ fontSize: '1.4rem' }, 120)
        .animate({ fontSize: '1.25rem' }, 120);
    }
  }

  function mostrarAlertaError(mensaje) {
    $('#booking-alert-success').hide();
    $('#booking-alert-error').text(mensaje).slideDown('fast');
  }


  // ==========================================================
  // FUNCIONES DE VALIDACIÓN INDIVIDUAL (BLUR / INPUT)
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
    const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

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

  $('#fecha-reserva').off('blur change').on('blur change', function () {
    validarCampoFecha();
    verificarFormularioCompleto();
  });

  $('#client-name').off('blur input').on('blur input', function () {
    validarCampoNombre();
    verificarFormularioCompleto();
  });

  $('#client-phone').off('blur input').on('blur input', function () {
    validarCampoTelefono();
    verificarFormularioCompleto();
  });

  $('#client-email').off('blur input').on('blur input', function () {
    validarCampoEmail();
    verificarFormularioCompleto();
  });

  function verificarFormularioCompleto() {
    const fechaOk = validarCampoFechaSilencioso();
    const horasOk = horasValidas;
    const nombreOk = validarCampoNombreSilencioso();
    const telefonoOk = validarCampoTelefonoSilencioso();
    const emailOk = validarCampoEmailSilencioso();

    const todoValido = fechaOk && horasOk && nombreOk && telefonoOk && emailOk;
    const $btn = $('#btn-submit-booking');

    if (todoValido) {
      $btn
        .prop('disabled', false)
        .removeClass('btn-disabled')
        .addClass('btn-ready')
        .empty()
        .append(
          $('<i>').addClass('fa-solid fa-circle-check'),
          document.createTextNode(' Confirmar y Reservar en Wally Park')
        );
    } else {
      $btn
        .prop('disabled', true)
        .removeClass('btn-ready')
        .addClass('btn-disabled')
        .empty()
        .append(
          $('<i>').addClass('fa-solid fa-lock'),
          document.createTextNode(' Completa los campos para reservar')
        );
    }

    return todoValido;
  }

  function validarCampoFechaSilencioso() {
    const f = $('#fecha-reserva').val();
    return Boolean(f && f >= fechaHoyFormato);
  }

  function validarCampoNombreSilencioso() {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test($('#client-name').val().trim());
  }

  function validarCampoTelefonoSilencioso() {
    return /^[0-9]{7,10}$/.test($('#client-phone').val().trim());
  }

  function validarCampoEmailSilencioso() {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test($('#client-email').val().trim());
  }


  // ==========================================================
  // [SEMANA 3 - MINI-BLOQUE 2]: COLA BLINDADA (44px, TRUNCADO, BUBBLING, ANTI-XSS)
  // ==========================================================
  function validarCampoCola() {
    const val = ($('#inputCancion').val() || '').trim();
    $('#inputCancion').removeClass('input-invalid input-valid');
    $('#errInputCancion').hide().text('');

    if (val.length < 3) {
      $('#errInputCancion').text('⚠️ Escribe el nombre del equipo o reto (mínimo 3 caracteres).').slideDown('fast');
      $('#inputCancion').addClass('input-invalid');
      return false;
    }

    $('#inputCancion').addClass('input-valid');
    return true;
  }

  $('#inputCancion')
    .off('blur.cola input.cola')
    .on('blur.cola', function () {
      $(this).attr('data-tocado', 'true');
      validarCampoCola();
    })
    .on('input.cola', function () {
      if ($(this).attr('data-tocado') === 'true' || $(this).hasClass('input-invalid')) {
        validarCampoCola();
      }
    });

  function agregarElementoACola(texto) {
    const $fila = $('<div>').addClass('fila-cancion');
    const $titulo = $('<span>').addClass('titulo-truncado').text(texto);
    const $btnQuitar = $('<button>')
      .addClass('btn-tactil btn-quitar btn-hidratable')
      .attr('data-hidratado', 'false')
      .attr('type', 'button')
      .attr('aria-label', 'Quitar de la cola')
      .text('✕');

    $fila.append($titulo, $btnQuitar);
    $('#listaCanciones').prepend($fila);
    hidratarBotonesDOM($fila);
  }

  agregarElementoACola('Reto Estelar: Los Halcones vs Club Altiplano — Cancha 2 Tunari Master (21:00)');
  agregarElementoACola('Lista de Espera VIP: Equipo Illimani Volley — Cancha 1 Climatizada (20:00)');

  $('#btnPedir').off('click').on('click', function () {
    if (!validarCampoCola()) return;
    const texto = $('#inputCancion').val().trim();
    agregarElementoACola(texto);
    registrarEventoTimestamp('COLA', 'Agregó reto a la cola: ' + texto);
    $('#inputCancion').val('').removeClass('input-invalid input-valid').removeAttr('data-tocado');
    $('#errInputCancion').hide();
  });

  // Delegación por Event Bubbling para eliminar filas dinámicas sin fugas de memoria
  $('#listaCanciones')
    .off('click', '.btn-quitar')
    .on('click', '.btn-quitar', function () {
      const eliminado = $(this).siblings('.titulo-truncado').text();
      $(this).closest('.fila-cancion').remove();
      registrarEventoTimestamp('COLA', 'Retiró de la cola: ' + eliminado);
    });


  // ==========================================================
  // [SEMANA 3 - MINI-BLOQUE 1]: RESERVA SEGURA ANTI-XSS (#formReserva -> #listaReservas)
  // ==========================================================
  function agregarReservaSeguraDOM(titular, cancha, horario, monto) {
    const $item = $('<li>').addClass('item-reserva');
    const $textoSeguro = $('<strong>').text(titular + ' — ');
    const detalleTexto = (horario && monto)
      ? `${cancha} (${horario}) • ${monto}`
      : cancha;
    const $detalleSala = $('<span>').text(detalleTexto);
    $item.append($textoSeguro, $detalleSala);
    $('#listaReservas').prepend($item);
  }

  agregarReservaSeguraDOM('Club Los Andes', 'Cancha 2: Tunari Master', '18:00 - 19:00', '70 BOB');

  // Prevención XSS: Se construyen nodos seguros usando .text() en lugar de concatenar HTML crudo
  $('#formReserva').off('submit').on('submit', function (e) {
    e.preventDefault();
    const nombre = ($('#clienteNombre').val() || '').trim();
    const sala = $('#salaSelect').val();
    if (!nombre) return;

    const $item = $('<li>').addClass('item-reserva');
    const $textoSeguro = $('<strong>').text(nombre + ' — ');
    const $detalleSala = $('<span>').text(sala);

    $item.append($textoSeguro, $detalleSala);
    $('#listaReservas').prepend($item);

    contadorReservas++;
    localStorage.setItem('deporzone_orders', String(contadorReservas));
    registrarEventoTimestamp('RESERVA_RAPIDA', 'Reserva Anti-XSS registrada: ' + nombre + ' — ' + sala);
    mostrarToastAlert('🛡️ Reserva Segura Registrada', nombre + ' — ' + sala, false);
    this.reset();
  });


  // ==========================================================
  // [PWA 5]: DETECTOR ONLINE / OFFLINE + SINCRONIZACIÓN LOCALSTORAGE
  // ==========================================================
  function actualizarEstadoRedPWA() {
    if (navigator.onLine) {
      $('#estadoRed')
        .text('🟢 En Línea')
        .css({ backgroundColor: '#dcfce7', color: '#166534' });

      const pendientes = JSON.parse(localStorage.getItem('deporzone_cola_offline') || '[]');
      if (pendientes.length > 0) {
        mostrarToastAlert(
          '🌐 Conexión Restablecida',
          'Se sincronizaron ' + pendientes.length + ' reserva(s) guardadas sin conexión.',
          false
        );
        localStorage.removeItem('deporzone_cola_offline');
      }
    } else {
      $('#estadoRed')
        .text('🟠 Sin Conexión (Modo Local)')
        .css({ backgroundColor: '#ffedd5', color: '#9a3412' });
    }
  }

  $(window).off('online offline').on('online offline', actualizarEstadoRedPWA);
  actualizarEstadoRedPWA();


  // ==========================================================
  // SUBMIT DEL FORMULARIO PRINCIPAL -> MODAL UI CON TIMER 30s
  // ==========================================================
  let timerInterval = null;
  let tiempoRestante = 30;

  $('#reservation-form').off('submit').on('submit', function (e) {
    e.preventDefault();

    const vFecha = validarCampoFecha();
    const vHoras = validarHorarios();
    const vNombre = validarCampoNombre();
    const vTel = validarCampoTelefono();
    const vEmail = validarCampoEmail();

    if (!vFecha || !vHoras || !vNombre || !vTel || !vEmail) {
      mostrarAlertaError('⚠️ Revisa los campos resaltados en rojo antes de proceder.');
      verificarFormularioCompleto();
      if (document.body.classList.contains('vista-mobile') && (!vFecha || !vHoras)) {
        activarSubpanelMovil($('#tab-reservar'), 'sub-horarios');
      }
      return;
    }

    const nombreCliente = $('#client-name').val().trim();
    const cancha = $('#summary-court').text();
    const total = $('#summary-total').text();
    const fecha = $('#fecha-reserva').val();
    const horas = horaFin - horaInicio;

    $('#modal-court-name').text(cancha);
    $('#modal-client-name').text(nombreCliente);
    $('#modal-schedule').text(`${fecha} (${horaInicio}:00 - ${horaFin}:00)`);
    $('#modal-guarantee').text('50 BOB (Reembolsable)');
    $('#modal-total-amount').text(`${total} (${horas} Horas)`);

    registrarEventoTimestamp('MODAL', `Abrió modal de confirmación para ${nombreCliente} (${total})`);
    $('#modal-overlay').fadeIn(250);

    iniciarTemporizadorModal();
  });

  function iniciarTemporizadorModal() {
    clearInterval(timerInterval);
    tiempoRestante = 30;
    actualizarTextoTimer();

    timerInterval = setInterval(function () {
      tiempoRestante--;
      actualizarTextoTimer();

      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        $('#modal-overlay').fadeOut(300, function () {
          registrarEventoTimestamp('TIMER', 'Expiró el temporizador de 30s de la reserva');
          mostrarToastAlert(
            '⚠️ Tarifa Flash Expirada',
            'Se agotó el tiempo límite de 30 segundos. Por favor vuelve a confirmar tu reserva.',
            true
          );
        });
      }
    }, 1000);
  }

  function actualizarTextoTimer() {
    const seg = tiempoRestante < 10 ? `0${tiempoRestante}` : tiempoRestante;
    $('#modal-countdown').text(`00:${seg}s`);
  }

  $('#modal-close-btn, #modal-cancel-btn').off('click').on('click', function () {
    registrarEventoTimestamp('MODAL', 'Canceló la confirmación en la ventana modal');
    cerrarModal();
  });

  $('#modal-overlay').off('click').on('click', function (e) {
    if ($(e.target).is('#modal-overlay')) {
      cerrarModal();
    }
  });

  function cerrarModal() {
    clearInterval(timerInterval);
    $('#modal-overlay').fadeOut(250);
  }

  $('#modal-confirm-btn').off('click').on('click', function () {
    clearInterval(timerInterval);

    const clienteConfirmado = $('#modal-client-name').text();
    const canchaConfirmada = $('#modal-court-name').text();
    const horarioConfirmado = $('#modal-schedule').text();
    const montoConfirmado = $('#modal-total-amount').text();

    contadorReservas++;
    localStorage.setItem('deporzone_orders', String(contadorReservas));
    agregarReservaSeguraDOM(clienteConfirmado, canchaConfirmada, horarioConfirmado, montoConfirmado);
    registrarEventoTimestamp('RESERVA', `Confirmó reserva para ${clienteConfirmado} (${montoConfirmado})`);

    if (!navigator.onLine) {
      const colaOffline = JSON.parse(localStorage.getItem('deporzone_cola_offline') || '[]');
      colaOffline.push({ clienteConfirmado, canchaConfirmada, horarioConfirmado, montoConfirmado });
      localStorage.setItem('deporzone_cola_offline', JSON.stringify(colaOffline));
    }

    $('#modal-overlay').fadeOut(250, function () {
      mostrarToastAlert(
        navigator.onLine ? '¡Reserva Procesada con Éxito! 🏆' : '🟠 Guardada en Modo Offline',
        navigator.onLine
          ? `Titular: ${clienteConfirmado} | Total: ${montoConfirmado}`
          : 'Sin internet: tu reserva quedó guardada localmente y se sincronizará al volver en línea.',
        !navigator.onLine
      );

      const $alerta = $('#booking-alert-success').empty();
      $alerta.append(
        $('<strong>').text(navigator.onLine ? '¡Reserva Registrada y Procesada! 🎉' : '🟠 Reserva Guardada en Modo Local'),
        $('<br>'),
        document.createTextNode('Canjea tu comprobante en caja de DeporZone Wally Park.'),
        $('<br>'),
        document.createTextNode('Garantía requerida: '),
        $('<strong>').text('50 BOB'),
        document.createTextNode(' | Total: '),
        $('<strong>').text(montoConfirmado)
      ).slideDown(300);

      setTimeout(function () {
        $('#client-name, #client-phone, #client-email, #client-notes').val('');
        $('input, select').removeClass('input-valid input-invalid');
        verificarFormularioCompleto();
      }, 3500);
    });
  });

  function mostrarToastAlert(titulo, mensaje, esWarning) {
    const $toast = $('#toast-alert');
    $('#toast-title').text(titulo);
    $('#toast-message').text(mensaje);

    if (esWarning) {
      $toast.addClass('toast-warning');
      $toast.find('.toast-icon i').attr('class', 'fa-solid fa-triangle-exclamation');
    } else {
      $toast.removeClass('toast-warning');
      $toast.find('.toast-icon i').attr('class', 'fa-solid fa-circle-check');
    }

    $toast.stop(true, true).slideDown(300).delay(3000).fadeOut(400);
  }


  // ==========================================================
  // FUNCIÓN 5: REDES SOCIALES INTERACTIVAS Y .fadeToggle()
  // ==========================================================
  $('#toggle-social-btn').off('click').on('click', function () {
    $('#social-collapsible-box').fadeToggle(300);
    registrarEventoTimestamp('UI', 'Alternó visibilidad de Redes Sociales (.fadeToggle)');
  });

  $('.social-card').off('click').on('click', function (e) {
    e.preventDefault();
    const redNombre = $(this).data('network');
    const urlDestino = $(this).attr('href');

    registrarEventoTimestamp('SOCIAL', `Abrió red social oficial: ${redNombre}`);
    mostrarToastAlert(
      '🌐 Canal Oficial DeporZone',
      `Abriendo ${redNombre}...`,
      false
    );

    setTimeout(function () {
      window.open(urlDestino, '_blank', 'noopener');
    }, 650);
  });

  // Inicialización de la pantalla al cargar
  $('#select-cancha-reserva').trigger('change');
  validarHorarios();
  verificarFormularioCompleto();
  renderizarBitacora();
  registrarEventoTimestamp('SISTEMA', 'Inició sesión en DeporZone Wally Park (Semana 3)');

});
