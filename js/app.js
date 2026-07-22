/* ============ COUNTDOWN ============ */
(function(){
  // total seconds: 29:43 = 1783
  let total = 29*60 + 43;
  const cdMin = document.getElementById('cdMin');
  const cdSec = document.getElementById('cdSec');
  const topTimer = document.getElementById('topTimer');

  function fmt(n){return String(n).padStart(2,'0')}

  function tick(){
    if(total <= 0){
      // reset back to 29:43 to keep urgency feel
      total = 29*60 + 43;
    }
    const m = Math.floor(total/60);
    const s = total % 60;
    if(cdMin) cdMin.textContent = fmt(m);
    if(cdSec) cdSec.textContent = fmt(s);
    if(topTimer) topTimer.textContent = fmt(m) + ':' + fmt(s);
    total--;
  }
  tick();
  setInterval(tick, 1000);
})();

/* carrossel agora é puro CSS marquee — sem JS necessário */

/* CTAs do checkout: deixar passar (links reais)
   Marca sessionStorage pra exit-intent saber que o user clicou
   NOTA: data-plan="basico" é interceptado pelo upsell modal separadamente */
document.querySelectorAll('[data-plan]:not([data-plan="basico"])').forEach(a=>{
  a.addEventListener('click',()=>{
    try { sessionStorage.setItem('clickedCheckout','1'); } catch(_){}
  });
});

/* Smooth scroll para âncoras internas (#premium, #pricing, etc.)
   IMPORTANTE: usa replaceState pra NÃO empilhar nada no history.
   Sem isso, no mobile o "voltar" acharia que o user tá saindo do site
   quando na verdade só rolou pra outra seção. */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var href = a.getAttribute('href');
    if(!href || href === '#') return;
    var target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth', block:'start'});
    // Atualiza URL sem poluir history stack
    try { history.replaceState(history.state, '', href); } catch(_){}
  });
});

/* ============ EXIT-INTENT MODAL ============ */
(function(){
  var modal = document.getElementById('exitModal');
  if(!modal) return;
  var closeBtn = modal.querySelector('.exit-close');
  var nopeBtn  = modal.querySelector('.exit-nope');
  var KEY = 'exitShown';

  function alreadyFired(){
    try { return sessionStorage.getItem(KEY) === '1'; } catch(_){ return false; }
  }
  function alreadyClicked(){
    try { return sessionStorage.getItem('clickedCheckout') === '1'; } catch(_){ return false; }
  }
  function open(){
    if(alreadyFired() || alreadyClicked()) return;
    try { sessionStorage.setItem(KEY,'1'); } catch(_){}
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  closeBtn && closeBtn.addEventListener('click', close);
  nopeBtn  && nopeBtn.addEventListener('click', function(e){ e.preventDefault(); close(); });
  modal.addEventListener('click', function(e){ if(e.target === modal) close(); });

  /* ----- DESKTOP: mouse saindo pela parte de cima da viewport ----- */
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if(!isTouch){
    document.addEventListener('mouseleave', function(e){
      if(e.clientY <= 0){
        setTimeout(function(){
          if(!modal.classList.contains('open')) open();
        }, 200);
      }
    });
  }

  /* ----- MOBILE: intercepta o botão "voltar" real do navegador ----- */
  if(isTouch){
    try {
      history.pushState({exitTrap:true}, '', location.href);
      window.addEventListener('popstate', function(){
        if(alreadyFired() || alreadyClicked()) return;
        open();
        history.pushState({exitTrap:true}, '', location.href);
      });
    } catch(_){}
  }

  /* tecla ESC fecha */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal.classList.contains('open')) close();
  });
})();

/* ============ REAL-TIME PURCHASE TOASTS ============ */
(function() {
  const names = [
    "João Silva", "Ana Costa", "Miguel Rodrigues", "Mariana Santos",
    "Tiago Melo", "Inês Ferreira", "Rui Sousa", "Filipa Oliveira",
    "André Lima", "Catarina Barbosa", "Filipe Azevedo", "Letícia Castro",
    "Gustavo Ribeiro", "Larissa Neves", "Pedro Gomes", "Beatriz Rocha",
    "Diogo Carvalho", "Isabela Mendes", "David Almeida", "Carolina Martins",
    "Rafael Cardoso", "Patrícia Vieira", "Artur Teixeira", "Vanessa Moreira",
    "Leonardo Nogueira", "Gabriela Dias", "Renan Ramos", "Aline Pereira"
  ];
  const actions = [
    "garantiu o Nihongo Fácil!",
    "acabou de garantir o acesso vitalício!",
    "desbloqueou o Plano Premium + 4 Bónus!",
    "garantiu os mapas mentais!"
  ];
  const times = [
    "há poucos segundos",
    "há 1 minuto",
    "há 45 segundos",
    "há 15 segundos",
    "há 2 minutos"
  ];

  // Create toast elements dynamically
  const toastEl = document.createElement('div');
  toastEl.className = 'purchase-toast';
  
  const infoEl = document.createElement('div');
  infoEl.className = 'toast-info';
  
  const titleEl = document.createElement('span');
  titleEl.className = 'toast-title';
  
  const subtitleEl = document.createElement('span');
  subtitleEl.className = 'toast-subtitle';
  
  infoEl.appendChild(titleEl);
  infoEl.appendChild(subtitleEl);
  toastEl.appendChild(infoEl);
  document.body.appendChild(toastEl);

  function formatName(fullName) {
    const parts = fullName.split(' ');
    if (parts.length > 1) {
      return parts[0] + ' ' + parts[1].charAt(0) + '.';
    }
    return fullName;
  }

  function showToast() {
    const name = names[Math.floor(Math.random() * names.length)];
    const formattedName = formatName(name);
    const action = actions[Math.floor(Math.random() * actions.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    
    titleEl.textContent = `${formattedName} ${action}`;
    subtitleEl.textContent = time;
    
    toastEl.classList.add('active');
    
    setTimeout(function() {
      toastEl.classList.remove('active');
    }, 6000); // Exibe por 6 segundos antes de ocultar
  }

  // Primeiro surge em 11 segundos, depois repete a cada 26 segundos
  setTimeout(function() {
    showToast();
    setInterval(showToast, 26000);
  }, 11000);
})();

/* ============ UPSELL MODAL FOR BASIC OFFER ============ */
(function(){
  var basicBtn = document.querySelector('a[data-plan="basico"]');
  var upsellModal = document.getElementById('upsellModal');
  if (!basicBtn || !upsellModal) return;

  var closeBtn = upsellModal.querySelector('.upsell-close');
  var declineBtn = document.getElementById('upsellDeclineBtn');
  var acceptBtn = document.getElementById('upsellAcceptBtn');

  function open(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    applyUTMsToUpsellLinks();
    upsellModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    upsellModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // useCapture: true garante que interceptamos ANTES de outros listeners
  basicBtn.addEventListener('click', open, true);
  
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      try { sessionStorage.setItem('clickedCheckout', '1'); } catch(_){}
      close();
    });
  }
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      try { sessionStorage.setItem('clickedCheckout', '1'); } catch(_){}
      close();
    });
  }

  // Close when clicking outside card
  upsellModal.addEventListener('click', function(e) {
    if (e.target === upsellModal) close();
  });

  // ESC key closes
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && upsellModal.classList.contains('open')) close();
  });

  function applyUTMsToUpsellLinks() {
    var params = window.location.search;
    if (!params) return;
    
    [acceptBtn, declineBtn].forEach(function(link) {
      if (link && link.href) {
        try {
          var url = new URL(link.href);
          var currentParams = new URLSearchParams(params);
          currentParams.forEach(function(value, key) {
            url.searchParams.set(key, value);
          });
          link.href = url.toString();
        } catch (e) {
          var separator = link.href.indexOf('?') !== -1 ? '&' : '?';
          link.href = link.href + separator + params.replace(/^\?/, '');
        }
      }
    });
  }
})();

/* ============ PASS-THROUGH UTM PARAMETERS TO HOTMART LINKS ============ */
(function() {
  function passUtmsToHotmartLinks() {
    var searchParams = new URLSearchParams(window.location.search);
    
    // Fallback: recupa parâmetros salvos no localStorage pelo Utmify se a URL atual estiver limpa
    var trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'xcod', 'sck', 'fbclid', 'gclid'];
    trackingKeys.forEach(function(key) {
      if (!searchParams.has(key)) {
        try {
          var stored = localStorage.getItem(key);
          if (stored && stored !== 'null' && stored !== 'undefined') {
            searchParams.set(key, stored);
          }
        } catch(e) {}
      }
    });

    if ([...searchParams.keys()].length === 0) return;

    document.querySelectorAll('a[href*="pay.hotmart.com"]').forEach(function(a) {
      try {
        var url = new URL(a.href);
        searchParams.forEach(function(val, key) {
          if (!url.searchParams.has(key)) {
            url.searchParams.set(key, val);
          }
        });
        a.href = url.toString();
      } catch (e) {
        var separator = a.href.indexOf('?') !== -1 ? '&' : '?';
        a.href = a.href + separator + searchParams.toString();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', passUtmsToHotmartLinks);
  } else {
    passUtmsToHotmartLinks();
  }

  // Intercepta o clique para garantir que os parâmetros estejam aplicados no momento exato do clique
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href*="pay.hotmart.com"]');
    if (link) {
      passUtmsToHotmartLinks();
    }
  }, true);
})();



