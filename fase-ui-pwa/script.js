/* ============================================================================
   SCRIPT PRINCIPAL — BITION S.R.L. (index.html y mobile.html)
   Diseño Web II • UPDS Sede La Paz • Ingeniería de Sistemas
   Contiene todas las funcionalidades técnicas de las guías aplicadas a Bition:
   1. Registro de Service Worker PWA y Detección de Dispositivo Móvil
   2. Hidratación SSR simulada transparente y Prevención de Memory Leaks (.off().on())
   3. DOM Nativo: Modo Oscuro (localStorage), Filtrado por data-categoria y Menú
   4. jQuery Efectos: Acordeones (.slideToggle) y Cambio Dinámico de Temática
   5. Consumo Asíncrono Fetch API + Lazy Loading + Buscador Mixto + IA Figurativa
   6. Seguridad Anti-XSS (.text()) y Cola Blindada (44px, Truncado, Bubbling)
   7. Calculador en Vivo (.animate()), Modal con setInterval(30s) y Toast Alert
   8. Centro de Consultas y Órdenes (Delegación click/dblclick/keyup/change/submit)
   9. Validación en Tiempo Real (blur al salir del campo + input) y Cola Offline
   ============================================================================ */

// ============================================================================
// [FUNCIONALIDAD 1]: REGISTRO DEL SERVICE WORKER (PWA OFFLINE-FIRST)
// ============================================================================
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => {
        console.log('[PWA Bition] Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA Bition] Registro de Service Worker omitido:', err);
      });
  });
}

// ============================================================================
// [FUNCIONALIDAD 2]: DETECCIÓN DE DISPOSITIVO MÓVIL / TABLET
// ============================================================================
function detectarDispositivoMovil() {
  const esMovil =
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const bannerMovil = document.getElementById('bannerDeteccionMovil');
  if (esMovil) {
    console.log('Dispositivo móvil detectado: vista adaptada disponible en mobile.html');
    if (bannerMovil) {
      bannerMovil.classList.add('visible');
    }
  } else if (bannerMovil) {
    bannerMovil.classList.remove('visible');
  }
}

window.addEventListener('resize', detectarDispositivoMovil);
detectarDispositivoMovil();

// ============================================================================
// [FUNCIONALIDAD 3]: MANIPULACIÓN DEL DOM NATIVO (DARK MODE + FILTRO CATEGORÍAS)
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  const themeBtn = document.getElementById('themeBtn');
  const bodyElement = document.body;

  // Recuperamos la preferencia guardada en localStorage al cargar
  if (localStorage.getItem('bition_tema') === 'oscuro') {
    bodyElement.classList.add('dark-mode');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      // classList.toggle alterna la clase dark-mode directamente en el DOM
      bodyElement.classList.toggle('dark-mode');
      const estaOscuro = bodyElement.classList.contains('dark-mode');
      localStorage.setItem('bition_tema', estaOscuro ? 'oscuro' : 'claro');
    });
  }

  // Filtrado de tarjetas de servicios usando atributo HTML5 dataset.categoria
  const botonesFiltro = document.querySelectorAll('.btn-filtro-cat');
  botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', function () {
      const categoria = boton.dataset.cat;
      const tarjetas = document.querySelectorAll('.tarjeta-modulo');

      tarjetas.forEach((card) => {
        const catCard = card.dataset.categoria;
        if (categoria === 'todos' || catCard === categoria) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});

// ============================================================================
// RESPALDO LOCAL DE MARCAS (Para ejecución directa con protocolo file://)
// ============================================================================
const MARCAS_RESPALDO = [
  { id: 101, marca: 'DATAMARK + IA', titular: 'Bition S.R.L.', claseNiza: 'Clase 42 • Software como Servicio', gaceta: 'Gaceta Oficial N° 1624', estado: 'Registrada SENAPI', similitudFonetica: 'Da-ta-mark / Datamarc', tipoBusqueda: 'Mixta (Fonética + Silábica + Semántica)', portada: 'icons/logo-datamark.svg' },
  { id: 102, marca: 'IPMATIC ERP', titular: 'Bition S.R.L.', claseNiza: 'Clase 42 • Gestión PI', gaceta: 'Gaceta Oficial N° 1628', estado: 'Registrada SENAPI', similitudFonetica: 'I-Pi-Ma-Tic / IP-Matik', tipoBusqueda: 'Denominativa + Control de Plazos', portada: 'icons/logo-ipmatic.svg' },
  { id: 103, marca: 'ANDES TECH BOLIVIA', titular: 'Innovación Altiplano S.A.', claseNiza: 'Clase 9 • Hardware y Apps', gaceta: 'Gaceta Oficial N° 1680', estado: 'Publicada (Plazo Oposición)', similitudFonetica: 'An-des Tek / Andestec', tipoBusqueda: 'Semántica y Natural', portada: 'icons/logo-ia.svg' },
  { id: 104, marca: 'ILLIMANI CLOUD', titular: 'Soluciones La Paz Ltda.', claseNiza: 'Clase 42 • Servicios Nube', gaceta: 'Gaceta Oficial N° 1681', estado: 'En Examen de Fondo', similitudFonetica: 'I-lli-ma-ni Kloud / Nube Illimani', tipoBusqueda: 'Semántica (Traducción)', portada: 'icons/logo-gaceta.svg' },
  { id: 105, marca: 'KUNTUR LOGÍSTICA', titular: 'Transportes Cóndor S.R.L.', claseNiza: 'Clase 39 • Transporte', gaceta: 'Gaceta Oficial N° 1682', estado: 'Con Oposición Activa', similitudFonetica: 'Kun-tur / Cuntur / Cóndor', tipoBusqueda: 'Fonética + Figurativa', portada: 'icons/logo-senapi.svg' },
  { id: 106, marca: 'UYUNI SALT LABS', titular: 'Cosmética Andina S.R.L.', claseNiza: 'Clase 3 • Cuidado Personal', gaceta: 'Gaceta Oficial N° 1683', estado: 'Publicada en Gaceta', similitudFonetica: 'U-yu-ni Salt / Salar Uyuni', tipoBusqueda: 'Mixta (Silábica + Figurativa)', portada: 'icons/logo-ia.svg' },
  { id: 107, marca: 'TIWANAKU PAY', titular: 'Fintech Bolivia S.A.', claseNiza: 'Clase 36 • Finanzas', gaceta: 'Gaceta Oficial N° 1684', estado: 'Registrada SENAPI', similitudFonetica: 'Ti-wa-na-ku Pei', tipoBusqueda: 'Fonética y Ortográfica', portada: 'icons/logo-datamark.svg' },
  { id: 108, marca: 'CHACALTAYA ENERGY', titular: 'Energías Limpias del Sur', claseNiza: 'Clase 4 • Energía', gaceta: 'Gaceta Oficial N° 1685', estado: 'Denegatoria en Revisión', similitudFonetica: 'Cha-cal-ta-ya', tipoBusqueda: 'Control Contingencias IPMatic', portada: 'icons/logo-ipmatic.svg' },
  { id: 109, marca: 'YUNGAS CAFÉ SELECTO', titular: 'Agroexportadora Caranavi', claseNiza: 'Clase 30 • Café', gaceta: 'Gaceta Oficial N° 1686', estado: 'Publicada en Gaceta', similitudFonetica: 'Yun-gas Ka-fe', tipoBusqueda: 'Búsqueda Figurativa IA', portada: 'icons/logo-gaceta.svg' },
  { id: 110, marca: 'SAMAIPATA BIO', titular: 'Laboratorios Valle Verde', claseNiza: 'Clase 5 • Farmacia', gaceta: 'Gaceta Oficial N° 1687', estado: 'Alerta Plazo Pruebas', similitudFonetica: 'Sa-mai-pa-ta', tipoBusqueda: 'Comparación de Sílabas', portada: 'icons/logo-senapi.svg' },
  { id: 111, marca: 'ORURO TEXTIL PRO', titular: 'Textilería Real S.R.L.', claseNiza: 'Clase 25 • Vestimenta', gaceta: 'Gaceta Oficial N° 1688', estado: 'Registrada SENAPI', similitudFonetica: 'O-ru-ro Teks-til', tipoBusqueda: 'Búsqueda Natural', portada: 'icons/logo-datamark.svg' },
  { id: 112, marca: 'TARIJA VINO DORADO', titular: 'Bodegas del Valle S.A.', claseNiza: 'Clase 33 • Bebidas', gaceta: 'Gaceta Oficial N° 1689', estado: 'Expediente Digitalizado', similitudFonetica: 'Ta-ri-ja Bi-no', tipoBusqueda: 'Semántica + Mixta', portada: 'icons/logo-ipmatic.svg' },
  { id: 113, marca: 'PANDO FORESTAL', titular: 'Maderas Amazónicas Ltda.', claseNiza: 'Clase 19 • Construcción', gaceta: 'Gaceta Oficial N° 1690', estado: 'Publicada en Gaceta', similitudFonetica: 'Pan-do Fo-res-tal', tipoBusqueda: 'Reconocimiento Visual IA', portada: 'icons/logo-ia.svg' },
  { id: 114, marca: 'SUCRE LEGAL GUARD', titular: 'Consorcio Jurídico Chuquisaca', claseNiza: 'Clase 45 • Servicios PI', gaceta: 'Gaceta Oficial N° 1691', estado: 'Vigilancia Activa', similitudFonetica: 'Su-kre Le-gal Gard', tipoBusqueda: 'Control Demandante / Demandado', portada: 'icons/logo-senapi.svg' },
  { id: 115, marca: 'POTOSÍ DATA MINER', titular: 'Ingeniería Minera Digital', claseNiza: 'Clase 42 • Datos', gaceta: 'Gaceta Oficial N° 1692', estado: 'Publicada en Gaceta', similitudFonetica: 'Po-to-si Da-ta Mai-ner', tipoBusqueda: 'Motor Mixto Completo IA', portada: 'icons/logo-gaceta.svg' }
];

// ============================================================================
// INICIALIZACIÓN PRINCIPAL CON JQUERY ($(document).ready)
// ============================================================================
$(document).ready(function () {

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 4]: HIDRATACIÓN SSR EN CADA BOTÓN Y MENÚ HAMBURGUESA
  // - Recorre cada <button> estático y dinámico de index.html y mobile.html
  // - Evita duplicación de listeners en RAM usando .off().on()
  // - Marca data-hidratado="true" sin volver a dibujar el DOM
  // --------------------------------------------------------------------------
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

        // Marcamos el botón como hidratado y registramos verificación limpia de clic
        $btn
          .attr('data-hidratado', 'true')
          .addClass('hidratado-activo')
          .off('click.bitionHidratacion')
          .on('click.bitionHidratacion', function () {
            $(this).attr('data-ultimo-evento', 'hidratado');
          });
      });
  }

  // Ejecución simulada de hidratación SSR al cargar la interfaz
  setTimeout(function () {
    hidratarBotonesDOM(document);
  }, 150);

  // Botón hamburguesa con limpieza previa de eventos (.off().on())
  $('#hamburgerBtn')
    .off('click')
    .on('click', function () {
      $('#navMenu').slideToggle(300);
    });

  // Navegación por pestañas inferiores en vista móvil (mobile.html)
  function cambiarTabMovil(tabId) {
    $('.mobile-tab-panel').removeClass('active');
    $('#' + tabId).addClass('active');
    $('.btn-nav-tab').removeClass('active');
    $('.btn-nav-tab[data-tab="' + tabId + '"]').addClass('active');
    if (!document.body.classList.contains('vista-mobile')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  $('.btn-nav-tab')
    .off('click')
    .on('click', function () {
      const targetTab = $(this).data('tab');
      cambiarTabMovil(targetTab);
    });

  // Sub-navegación interna en la vista móvil compacta sin scroll vertical
  function activarSubpanelMovil($panelPadre, subpanelId) {
    if (!$panelPadre || !$panelPadre.length) return;
    $panelPadre.find('.mobile-subpanel').removeClass('active');
    $panelPadre.find('#' + subpanelId).addClass('active');
    $panelPadre.find('.btn-subtab').removeClass('active');
    $panelPadre.find('.btn-subtab[data-subtab="' + subpanelId + '"]').addClass('active');
  }

  $('.btn-subtab')
    .off('click')
    .on('click', function () {
      const $btn = $(this);
      const subpanelId = $btn.data('subtab');
      const $panelPadre = $btn.closest('.mobile-tab-panel');
      if (subpanelId && $panelPadre.length) {
        activarSubpanelMovil($panelPadre, subpanelId);
      }
    });

  $('.link-tab-movil')
    .off('click')
    .on('click', function (e) {
      e.preventDefault();
      const targetTab = $(this).data('tab');
      cambiarTabMovil(targetTab);
      $('#navMenu').slideUp(200);
    });

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 5]: EFECTOS JQUERY — ACORDEONES Y CAMBIO DINÁMICO DE TEMÁTICA
  // --------------------------------------------------------------------------
  $('.accordion-btn')
    .off('click')
    .on('click', function () {
      const $panel = $(this).next('.accordion-panel');
      // En vista móvil compacta, cierra otros paneles hermanos para evitar desborde vertical
      if (document.body.classList.contains('vista-mobile')) {
        $(this)
          .closest('.seccion-card')
          .find('.accordion-panel')
          .not($panel)
          .slideUp(150);
      }
      $panel.slideToggle('fast');
    });

  // Cambio dinámico de temática corporativa sin recargar la página
  const configuracionTemas = {
    datamark: {
      clase: 'tema-datamark',
      icono: '🔍',
      titulo: 'Datamark — Vigilancia y Anterioridades',
      desc: 'Base de datos migrada mensualmente desde la Gaceta Oficial de Bolivia para estudiar viabilidad antes de acudir al SENAPI.'
    },
    ia: {
      clase: 'tema-ia',
      icono: '🧠',
      titulo: 'Datamark + IA — Búsqueda Mixta y Figurativa',
      desc: 'Búsquedas simultáneas fonéticas, silábicas, semánticas, naturales y reconocimiento visual de logotipos con Inteligencia Artificial.'
    },
    ipmatic: {
      clase: 'tema-ipmatic',
      icono: '⚖️',
      titulo: 'IPMatic — Gestión Integral de Propiedad Intelectual',
      desc: 'Control de formularios SENAPI, oposiciones como demandante o demandado, denegatorias, plazos de prueba y expedientes escaneados.'
    }
  };

  $('.btn-tema-sistema')
    .off('click')
    .on('click', function () {
      const tema = $(this).data('tema');
      const info = configuracionTemas[tema];
      if (!info) return;

      $('#panelTematico')
        .removeClass('tema-datamark tema-ia tema-ipmatic')
        .addClass(info.clase);

      // Actualización controlada de ícono, título y descripción con .text() (Anti-XSS)
      $('#tituloTema')
        .empty()
        .append(
          $('<span>').attr('id', 'iconoTema').text(info.icono),
          document.createTextNode(' ' + info.titulo)
        );
      $('#descTema').text(info.desc);
    });

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 6]: CATÁLOGO ASÍNCRONO FETCH + LAZY LOADING + KEYUP + BUBBLING
  // --------------------------------------------------------------------------
  function renderizarCatalogoMarcas(marcas) {
    const $contenedor = $('#catalogoMarcas');
    $contenedor.empty();

    marcas.forEach((item) => {
      // Construcción segura de nodos con carga diferida (loading="lazy") en logotipos
      const $card = $('<article>')
        .addClass('tarjeta-pista')
        .attr('data-id', item.id)
        .attr(
          'data-busqueda',
          (
            item.marca +
            ' ' +
            item.titular +
            ' ' +
            item.gaceta +
            ' ' +
            item.similitudFonetica +
            ' ' +
            item.tipoBusqueda
          ).toLowerCase()
        );

      const $img = $('<img>')
        .attr('src', item.portada)
        .attr('alt', item.marca)
        .attr('loading', 'lazy')
        .attr('width', '64')
        .attr('height', '64');

      const $info = $('<div>').addClass('info-pista');
      $info.append($('<h4>').text(item.marca + ' — ' + item.gaceta));
      $info.append($('<p>').text(item.titular + ' • ' + item.estado));
      $info.append($('<p>').text('Análisis (' + item.tipoBusqueda + '): ' + item.similitudFonetica));

      const $btn = $('<button>')
        .addClass('btn-tactil btn-agregar-cola btn-hidratable')
        .attr('data-hidratado', 'false')
        .attr('type', 'button')
        .text('+ Vigilar');

      $card.append($img, $info, $btn);
      $contenedor.append($card);
    });

    // Hidratamos los botones generados dinámicamente en el catálogo
    hidratarBotonesDOM($contenedor);
  }

  // Consumo asíncrono con Fetch API validando response.ok
  fetch('data/marcas.json')
    .then((response) => {
      if (!response.ok) throw new Error('Error al consultar data/marcas.json');
      return response.json();
    })
    .then((data) => {
      renderizarCatalogoMarcas(data);
    })
    .catch((err) => {
      console.warn('[Bition] Cargando catálogo de respaldo local:', err.message);
      renderizarCatalogoMarcas(MARCAS_RESPALDO);
    });

  // Buscador en vivo mediante evento keyup (.show() / .hide())
  function filtrarMarcasEnVivo(texto) {
    const filtro = texto.trim().toLowerCase();
    $('#catalogoMarcas .tarjeta-pista').each(function () {
      const contenido = $(this).attr('data-busqueda') || '';
      if (contenido.indexOf(filtro) !== -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  $('#searchMarca')
    .off('keyup')
    .on('keyup', function () {
      filtrarMarcasEnVivo($(this).val());
    });

  $('.btn-modo-ia')
    .off('click')
    .on('click', function () {
      const q = $(this).data('query') || '';
      $('#searchMarca').val(q);
      filtrarMarcasEnVivo(q);
    });

  // Delegación de eventos por Event Bubbling para añadir marcas a vigilancia
  $('#catalogoMarcas')
    .off('click', '.btn-agregar-cola')
    .on('click', '.btn-agregar-cola', function () {
      const $tarjeta = $(this).closest('.tarjeta-pista');
      const tituloMarca = $tarjeta.find('h4').text();
      agregarElementoACola('Vigilancia: ' + tituloMarca);
      mostrarToast('Marca agregada a la lista de vigilancia IPMatic.');
    });

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 9]: VALIDACIÓN EN TIEMPO REAL AL ENTRAR/SALIR DE CADA CAMPO
  // - Al hacer clic dentro de un campo y luego hacer clic fuera (evento blur),
  //   se evalúa la regla correspondiente y se muestra/oculta el error al instante.
  // - También actualiza mientras el usuario corrige el dato (evento input).
  // --------------------------------------------------------------------------
  const reglasValidacion = {
    '#nombre': {
      err: '#errNombre',
      validar: (val) => val.trim().length >= 2
    },
    '#correo': {
      err: '#errCorreo',
      validar: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
    },
    '#mensaje': {
      err: '#errMensaje',
      validar: (val) => val.trim().length >= 5
    },
    '#clienteNombre': {
      err: '#errClienteNombre',
      validar: (val) => val.trim().length >= 2
    },
    '#inputCancion': {
      err: '#errInputCancion',
      validar: (val) => val.trim().length >= 3
    },
    '#hrs': {
      err: '#errHrs',
      validar: (val) => {
        const n = Number(val);
        return Number.isInteger(n) && n >= 1 && n <= 36;
      }
    },
    '#userTikTok': {
      err: '#errUserTikTok',
      validar: (val) => val.trim().length >= 2
    },
    '#loginUsuario': {
      err: '#errLoginUsuario',
      validar: (val) => val.trim().length >= 3
    },
    '#loginPassword': {
      err: '#errLoginPassword',
      validar: (val) => val.trim().length >= 4
    }
  };

  function validarCampo(selector) {
    const regla = reglasValidacion[selector];
    const $campo = $(selector);
    if (!regla || !$campo.length) return true;

    const esValido = regla.validar($campo.val() || '');
    const $err = $(regla.err);

    if (esValido) {
      $campo.removeClass('input-invalido').addClass('input-valido');
      $err.stop(true, true).fadeOut(180);
    } else {
      $campo.removeClass('input-valido').addClass('input-invalido');
      $err.stop(true, true).fadeIn(180);
    }
    return esValido;
  }

  function limpiarEstadoValidacion(selectores) {
    selectores.forEach((selector) => {
      const regla = reglasValidacion[selector];
      $(selector).removeClass('input-invalido input-valido').removeAttr('data-tocado');
      if (regla) $(regla.err).hide();
    });
  }

  function configurarValidacionTiempoReal() {
    Object.keys(reglasValidacion).forEach((selector) => {
      $(selector)
        .off('blur.validacion input.validacion')
        .on('blur.validacion', function () {
          // Marca que el usuario ya salió del campo y ejecuta la validación visual
          $(this).attr('data-tocado', 'true');
          validarCampo(selector);
        })
        .on('input.validacion', function () {
          // Si ya fue validado previamente o está escribiendo, actualiza en tiempo real
          if ($(this).attr('data-tocado') === 'true' || $(this).hasClass('input-invalido')) {
            validarCampo(selector);
          }
        });
    });
  }

  configurarValidacionTiempoReal();

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 10]: SEGURIDAD ANTI-XSS (.text()) Y COLA BLINDADA DE PLAZOS
  // --------------------------------------------------------------------------
  $('#formReserva')
    .off('submit')
    .on('submit', function (e) {
      e.preventDefault();
      if (!validarCampo('#clienteNombre')) return;

      const nombre = $('#clienteNombre').val().trim();
      const estado = $('#salaSelect').val();

      // PREVENCIÓN XSS: Construcción de nodos seguros con .text() en lugar de HTML crudo
      const $item = $('<li>').addClass('item-reserva');
      const $textoSeguro = $('<strong>').text(nombre + ' — ');
      const $detalleEstado = $('<span>').text(estado);

      $item.append($textoSeguro, $detalleEstado);
      $('#listaReservas').prepend($item);
      this.reset();
      limpiarEstadoValidacion(['#clienteNombre']);
    });

  // Cola con botones táctiles de 44px, truncado seguro y delegación .off().on()
  function agregarElementoACola(texto) {
    const $fila = $('<div>').addClass('fila-cancion');
    const $titulo = $('<span>').addClass('titulo-truncado').text(texto);
    const $btnQuitar = $('<button>')
      .addClass('btn-tactil btn-quitar btn-hidratable')
      .attr('data-hidratado', 'false')
      .attr('type', 'button')
      .attr('aria-label', 'Quitar expediente')
      .text('✕');

    $fila.append($titulo, $btnQuitar);
    $('#listaCanciones').prepend($fila);
    hidratarBotonesDOM($fila);
  }

  agregarElementoACola('Plazo Presentación Pruebas Oposición — Marca KUNTUR LOGÍSTICA (SENAPI)');
  agregarElementoACola('Revisión Mensual Gaceta Oficial N° 1692 — Datamark + IA');

  $('#btnPedir')
    .off('click')
    .on('click', function () {
      if (!validarCampo('#inputCancion')) return;
      const texto = $('#inputCancion').val().trim();
      agregarElementoACola(texto);
      $('#inputCancion').val('');
      limpiarEstadoValidacion(['#inputCancion']);
    });

  // Eliminación delegada para prevenir fugas de memoria
  $('#listaCanciones')
    .off('click', '.btn-quitar')
    .on('click', '.btn-quitar', function () {
      $(this).closest('.fila-cancion').remove();
    });

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 10]: CALCULADOR DINÁMICO + MODAL TEMPORIZADOR 30s + TOAST PRO
  // --------------------------------------------------------------------------
  let intervaloModal = null;

  function calcularTotalBition() {
    const tarifaBase = parseInt($('#planTarifa').val(), 10) || 250;
    const meses = Math.max(1, parseInt($('#hrs').val(), 10) || 1);
    let extras = 0;

    $('.extra-modulo:checked').each(function () {
      extras += parseInt($(this).val(), 10) || 0;
    });

    const totalCalculado = (tarifaBase + extras) * meses;

    // Animación visual del monto total mediante .animate()
    $('#total')
      .text(totalCalculado)
      .stop(true, true)
      .animate({ opacity: 0.45 }, 120)
      .animate({ opacity: 1 }, 180);

    return totalCalculado;
  }

  $('#planTarifa, #hrs, .extra-modulo')
    .off('input change')
    .on('input change', calcularTotalBition);

  // Toast Alert flotante (.slideDown -> 3s -> .fadeOut)
  function mostrarToast(mensaje) {
    $('#toastMsg').text(mensaje);
    $('#toastAlert').stop(true, true).slideDown(250).delay(3000).fadeOut(400);
  }

  function cerrarModalConfirmacion() {
    if (intervaloModal) {
      clearInterval(intervaloModal); // Limpieza del intervalo para evitar memory leaks
      intervaloModal = null;
    }
    $('#modalReserva').fadeOut(250);
  }

  $('#btnModal')
    .off('click')
    .on('click', function () {
      if (!validarCampo('#hrs')) return;
      const total = calcularTotalBition();
      const planTexto = $('#planTarifa option:selected').text();
      const meses = $('#hrs').val() || 1;

      $('#estadoExpirado').hide();
      $('#modalDetalle').text(planTexto + ' (' + meses + ' mes/es)');
      $('#modalMonto').text(total);

      let segundos = 30;
      $('#timerCountdown').text('00:30');
      $('#modalReserva').css('display', 'flex').hide().fadeIn(200);

      if (intervaloModal) clearInterval(intervaloModal);

      // Cuenta regresiva de 30 segundos en ventana modal
      intervaloModal = setInterval(function () {
        segundos--;
        const formato = segundos < 10 ? '00:0' + segundos : '00:' + segundos;
        $('#timerCountdown').text(formato);

        if (segundos <= 0) {
          cerrarModalConfirmacion();
          $('#estadoExpirado').fadeIn();
          mostrarToast('La reserva temporal de tarifa expiró. Vuelve a confirmar.');
        }
      }, 1000);
    });

  $('#btnCerrarModal, #btnCancelarModal')
    .off('click')
    .on('click', cerrarModalConfirmacion);

  $('#btnProcesarModal')
    .off('click')
    .on('click', function () {
      const monto = $('#modalMonto').text();
      cerrarModalConfirmacion();
      mostrarToast('Cotización de Bition S.R.L. confirmada por ' + monto + ' BOB.');
    });

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 11]: CENTRO DE CONSULTAS Y ÓRDENES (DELEGACIÓN DE EVENTOS)
  // --------------------------------------------------------------------------
  const liveContainer = document.getElementById('liveContainer');
  const chatInput = document.getElementById('chatInput');
  const logOutput = document.getElementById('logOutput');

  function logEvent(tipo, mensaje) {
    if (!logOutput) return;
    const hora = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.textContent = '[' + hora + '] ' + tipo + ': ' + mensaje;
    logOutput.prepend(item);
  }

  if (liveContainer) {
    liveContainer.addEventListener('click', function (e) {
      const target = e.target.closest('button');
      if (!target) return;
      if (target.dataset.prod) {
        logEvent('Consulta', 'Acción ejecutada: ' + target.dataset.prod);
      } else if (target.dataset.action === 'like') {
        logEvent('Prioridad', 'Seguimiento marcado como prioritario.');
      }
    });

    liveContainer.addEventListener('dblclick', function () {
      logEvent('Prioridad Alta', 'Alerta destacada en el monitor de Gaceta Oficial.');
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keyup', function (e) {
      logEvent('Nota', '"' + e.target.value + '"');
    });
  }

  // Cambio de variante de servicio (change) y registro de orden (submit + preventDefault)
  const variantSelect = document.getElementById('variantSelect');
  const orderForm = document.getElementById('orderForm');
  const userTikTok = document.getElementById('userTikTok');
  const logDia2 = document.getElementById('logDia2');

  function addLogDia2(tipo, msg) {
    if (!logDia2) return;
    const t = new Date().toLocaleTimeString();
    const row = document.createElement('div');
    row.textContent = '[' + t + '] ' + tipo + ': ' + msg;
    logDia2.prepend(row);
  }

  if (variantSelect) {
    variantSelect.addEventListener('change', function (e) {
      addLogDia2('Modalidad', 'Seleccionada: ' + e.target.value);
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validarCampo('#userTikTok')) return;
      const variante = variantSelect ? variantSelect.value : '';
      const cliente = userTikTok ? userTikTok.value.trim() : '';
      addLogDia2('Solicitud', 'Registrada para ' + cliente + ' (' + variante + ')');
      orderForm.reset();
      limpiarEstadoValidacion(['#userTikTok']);
    });
  }

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 12]: DETECTOR ONLINE/OFFLINE + VALIDACIÓN DE FORMULARIO
  // --------------------------------------------------------------------------
  function actualizarEstadoRed() {
    if (navigator.onLine) {
      $('#estadoRed')
        .text('🟢 En Línea')
        .css('background', '#dcfce7');

      // Sincronización automática de solicitudes pendientes en localStorage
      const pendientes = JSON.parse(localStorage.getItem('bition_cola_offline') || '[]');
      if (pendientes.length > 0) {
        mostrarToast('Conexión restablecida: ' + pendientes.length + ' solicitud(es) enviada(s).');
        localStorage.removeItem('bition_cola_offline');
      }
    } else {
      $('#estadoRed')
        .text('🟠 Sin Conexión (Modo Local)')
        .css('background', '#ffedd5');
    }
  }

  $(window).off('online offline').on('online offline', actualizarEstadoRed);
  actualizarEstadoRed();

  $('#pwaForm')
    .off('submit')
    .on('submit', function (e) {
      e.preventDefault();
      const okNombre = validarCampo('#nombre');
      const okCorreo = validarCampo('#correo');
      const okMensaje = validarCampo('#mensaje');
      const valido = okNombre && okCorreo && okMensaje;

      const nombre = $('#nombre').val().trim();
      const correo = $('#correo').val().trim();
      const mensaje = $('#mensaje').val().trim();

      if (valido) {
        if (navigator.onLine) {
          $('#successAlert')
            .text('✅ Solicitud enviada con éxito al equipo de Bition S.R.L. Te responderemos a la brevedad.')
            .stop(true, true)
            .slideDown()
            .delay(3000)
            .slideUp();
        } else {
          // Respaldo offline en localStorage cuando no hay conexión
          const cola = JSON.parse(localStorage.getItem('bition_cola_offline') || '[]');
          cola.push({ nombre, correo, mensaje, fecha: new Date().toISOString() });
          localStorage.setItem('bition_cola_offline', JSON.stringify(cola));

          $('#successAlert')
            .text('🟠 Sin conexión: Tu solicitud fue guardada localmente y se enviará al recuperar internet.')
            .stop(true, true)
            .slideDown()
            .delay(3500)
            .slideUp();
        }
        $('#pwaForm')[0].reset();
        limpiarEstadoValidacion(['#nombre', '#correo', '#mensaje']);
      }
    });

  // --------------------------------------------------------------------------
  // [FUNCIONALIDAD 13]: LOGIN POR ROLES E INDICADOR <span> DE VISTA ACTIVA
  // - Evalúa cuenta y contraseña para 3 roles: Cliente, Trabajador y Admin
  // - Actualiza el <span id="badgeRolVista"> y persiste en localStorage
  // --------------------------------------------------------------------------
  const CUENTAS_BITION = {
    cliente: {
      pass: '1234',
      rol: 'cliente',
      etiqueta: '👤 Vista: Cliente',
      clase: 'rol-cliente'
    },
    trabajador: {
      pass: '1234',
      rol: 'trabajador',
      etiqueta: '💼 Vista: Trabajador',
      clase: 'rol-trabajador'
    },
    admin: {
      pass: '1234',
      rol: 'admin',
      etiqueta: '🛡️ Vista: Administrador',
      clase: 'rol-admin'
    }
  };

  function actualizarVistaPorRol(rolClave) {
    const $badge = $('#badgeRolVista');
    const $btnAbrir = $('#btnAbrirLogin');
    const $btnCerrarSesion = $('#btnCerrarSesion');
    const esVistaMovil = document.body.classList.contains('vista-mobile');

    $badge.removeClass('rol-invitado rol-cliente rol-trabajador rol-admin');

    const perfil = rolClave && CUENTAS_BITION[rolClave] ? CUENTAS_BITION[rolClave] : null;
    if (perfil) {
      $badge.addClass(perfil.clase).text(perfil.etiqueta);
      $btnAbrir.text(esVistaMovil ? '👤 Rol' : '👤 Cambiar Cuenta');
      $btnCerrarSesion.show();
    } else {
      $badge.addClass('rol-invitado').text('🔒 Vista: Invitado');
      $btnAbrir.text(esVistaMovil ? '🔑 Login' : '🔑 Iniciar Sesión');
      $btnCerrarSesion.hide();
    }
  }

  // Restaura la vista del rol previamente autenticado en index.html o mobile.html
  actualizarVistaPorRol(localStorage.getItem('bition_sesion_rol'));

  $('#btnAbrirLogin')
    .off('click')
    .on('click', function () {
      $('#errCredencialesLogin').hide();
      limpiarEstadoValidacion(['#loginUsuario', '#loginPassword']);
      $('#modalLogin').css('display', 'flex').hide().fadeIn(200);
    });

  function cerrarModalLogin() {
    $('#modalLogin').fadeOut(200);
  }

  $('#btnCerrarLogin')
    .off('click')
    .on('click', cerrarModalLogin);

  $('#modalLogin')
    .off('click.fondoLogin')
    .on('click.fondoLogin', function (e) {
      if (e.target === this) cerrarModalLogin();
    });

  $('#formLogin')
    .off('submit')
    .on('submit', function (e) {
      e.preventDefault();
      $('#errCredencialesLogin').hide();

      const okUser = validarCampo('#loginUsuario');
      const okPass = validarCampo('#loginPassword');
      if (!okUser || !okPass) return;

      const usuario = ($('#loginUsuario').val() || '').trim().toLowerCase();
      const password = ($('#loginPassword').val() || '').trim();
      const cuenta = CUENTAS_BITION[usuario];

      if (!cuenta || cuenta.pass !== password) {
        $('#errCredencialesLogin').stop(true, true).fadeIn(180);
        return;
      }

      localStorage.setItem('bition_sesion_rol', cuenta.rol);
      actualizarVistaPorRol(cuenta.rol);
      $('#formLogin')[0].reset();
      limpiarEstadoValidacion(['#loginUsuario', '#loginPassword']);
      cerrarModalLogin();
      mostrarToast('Sesión iniciada con ' + cuenta.etiqueta);
    });

  $('#btnCerrarSesion')
    .off('click')
    .on('click', function () {
      localStorage.removeItem('bition_sesion_rol');
      actualizarVistaPorRol(null);
      $('#formLogin')[0].reset();
      limpiarEstadoValidacion(['#loginUsuario', '#loginPassword']);
      cerrarModalLogin();
      mostrarToast('Sesión cerrada. Modo Invitado activo.');
    });

});
