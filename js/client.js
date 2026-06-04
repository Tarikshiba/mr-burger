/* =========================================================
   MR. BURGER — CLIENT.JS
   Logique panier, commandes, animations cote client.
   Depend de window.MrBurger (core.js).
   ========================================================= */
(function () {
  'use strict';
  var MB = window.MrBurger;

  /* --- CATALOGUE COMPLET (id, nom, prix, detail, categorie, options) --- */
  var MENU = [
    { cat: 'Entrees', items: [
      { id: 'mozza-sticks', nom: 'Mozza Sticks', prix: 4500 },
      { id: 'chicken-pops', nom: 'Chicken Pops', prix: 4000 },
      { id: 'crunchy-chicken', nom: 'Crunchy Chicken', prix: 4500 },
      { id: 'cheesy-veg-fries', nom: 'Cheesy Veg-Fries', prix: 4000 },
      { id: 'philli-fries', nom: 'Philli-Fries', prix: 4500 },
      { id: 'poulet-fries', nom: 'Poulet-Fries', prix: 4500 }
    ]},
    { cat: 'Specialites Maison', items: [
      { id: 'mr-burger', nom: 'Mr Burger', prix: 8000, detail: 'Recouvert de fromage fondu a profusion', combo: true },
      { id: 'flaming-burger', nom: 'Flaming Burger', prix: 8000, detail: 'Injection de sauce piquante extreme', flamme: true, extreme: true, combo: true },
      { id: 'sizzling-burger', nom: 'Sizzling Burger', prix: 8000, detail: 'Servi dans une creme champignon crepitante', combo: true }
    ]},
    { cat: 'Burgers Boeuf', items: [
      { id: 'cheese-classique', nom: 'Cheese Classique', prix: 3500, combo: true },
      { id: 'chilli', nom: 'Chilli 🌶️', prix: 3500, combo: true },
      { id: 'champii', nom: 'Champii', prix: 4000, combo: true },
      { id: 'mozza-crunchy', nom: 'Mozza Crunchy', prix: 4500, combo: true },
      { id: 'bbq', nom: 'BBQ', prix: 4500, combo: true }
    ]},
    { cat: 'Burgers Poulet', items: [
      { id: 'chicken-cheese', nom: 'Chicken Cheese', prix: 3500, combo: true },
      { id: 'chicken-pesto', nom: 'Chicken Pesto', prix: 4000, combo: true },
      { id: 'zinger', nom: 'Zinger', prix: 4500, combo: true },
      { id: 'mexicaine', nom: 'Mexicaine', prix: 4500, combo: true }
    ]},
    { cat: 'Vege / Aquatique', items: [
      { id: 'falafel', nom: 'Falafel', prix: 3500, combo: true },
      { id: 'v-burger', nom: 'V-Burger', prix: 3500, combo: true },
      { id: 'fish-burger', nom: 'Fish Burger', prix: 4000, combo: true }
    ]},
    { cat: 'Extras', items: [
      { id: 'kids-meal', nom: 'Kids Meal', prix: 5000 },
      { id: 'nutella-burger', nom: 'Nutella Burger', prix: 4000 }
    ]}
  ];
  var SUPP_COMBO = 2000; // Combo : +2000 (frites + boisson + coleslaw)

  /* Degrades thematiques pour les photos placeholder */
  var GRADS = ['linear-gradient(135deg,#7a3b00,#1a0d00)','linear-gradient(135deg,#5a0000,#1a0000)','linear-gradient(135deg,#003d1a,#001a0d)','linear-gradient(135deg,#5a4a00,#1a1500)','linear-gradient(135deg,#3a3a3a,#111)'];

  function trouverItem(id) {
    for (var i = 0; i < MENU.length; i++) {
      var it = MENU[i].items.filter(function (x) { return x.id === id; })[0];
      if (it) { return it; }
    }
    return null;
  }

  /* --- RENDU DU MENU --- */
  function initMenu() {
    var root = document.getElementById('menu');
    var html = '';
    var g = 0;
    MENU.forEach(function (groupe) {
      html += '<h2 class="menu-cat-titre">' + groupe.cat + '</h2><div class="menu-grid">';
      groupe.items.forEach(function (it) {
        var grad = GRADS[(g++) % GRADS.length];
        var badge = it.extreme ? '<span class="badge badge-extreme">Extreme</span>' : '';
        var flamme = it.flamme ? '<span class="flamme">🔥</span> ' : '';
        var combo = it.combo ? '<label class="combo-check"><input type="checkbox" class="opt-combo" data-id="' + it.id + '"/> Combo +' + MB.formatPrix(SUPP_COMBO) + '</label>' : '';
        html += '' +
          '<div class="carte-article" id="carte-' + it.id + '">' +
            '<div class="carte-photo" style="--photo-grad:' + grad + '"></div>' +
            '<div class="carte-body">' +
              '<div class="carte-nom">' + flamme + it.nom + ' <span class="badge-slot">' + badge + '</span></div>' +
              '<div class="carte-detail">' + (it.detail || '') + '</div>' +
              '<div class="carte-prix">' + MB.formatPrix(it.prix) + '</div>' +
              combo +
              '<div class="carte-actions">' +
                '<button class="btn btn-ajouter" data-id="' + it.id + '">Ajouter</button>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
      html += '</div>';
    });
    root.innerHTML = html;

    // Branche les boutons Ajouter
    root.querySelectorAll('.btn-ajouter').forEach(function (btn) {
      btn.addEventListener('click', function (e) { ajouterAuPanier(btn.getAttribute('data-id'), e); });
    });
    rafraichirRuptures();
  }

  /* --- RUPTURES : grise les articles indisponibles (polling depuis le KDS) --- */
  function rafraichirRuptures() {
    MENU.forEach(function (groupe) {
      groupe.items.forEach(function (it) {
        var carte = document.getElementById('carte-' + it.id);
        if (!carte) { return; }
        var btn = carte.querySelector('.btn-ajouter');
        var slot = carte.querySelector('.badge-slot');
        if (MB.estEnRupture(it.id)) {
          carte.classList.add('carte-indispo');
          if (btn) { btn.disabled = true; btn.textContent = 'Indisponible'; }
          if (slot && slot.querySelector('.badge-indispo') === null) {
            slot.innerHTML += '<span class="badge badge-indispo">Indisponible</span>';
          }
        } else {
          carte.classList.remove('carte-indispo');
          if (btn && btn.textContent === 'Indisponible') { btn.disabled = false; btn.textContent = 'Ajouter'; }
          var bi = carte.querySelector('.badge-indispo'); if (bi) { bi.remove(); }
        }
      });
    });
  }

  /* --- AJOUT AU PANIER + animation signature (arc vers l'icone panier) --- */
  function ajouterAuPanier(id, evt) {
    var it = trouverItem(id);
    if (!it || MB.estEnRupture(id)) { return; }
    // 🔊 SON : cart-add.mp3
    MB.jouerSon('cart-add');

    var carte = document.getElementById('carte-' + id);
    var combo = carte && carte.querySelector('.opt-combo') ? carte.querySelector('.opt-combo').checked : false;
    var prix = it.prix + (combo ? SUPP_COMBO : 0);
    var nom = it.nom + (combo ? ' (Combo)' : '');
    var key = id + (combo ? '-combo' : '');

    var panier = MB.getPanier();
    var existe = panier.filter(function (a) { return a.key === key; })[0];
    if (existe) { existe.qte += 1; }
    else { panier.push({ key: key, id: id, nom: nom, prix: prix, qte: 1 }); }
    MB.setPanier(panier);
    majPanierCount();
    animerVol(evt);
  }

  /* Animation : un burger vole en arc de cercle vers l'icone panier */
  function animerVol(evt) {
    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cible = document.getElementById('panier-icone');
    if (reduit || !cible || !evt) { pulsePanier(); return; }
    var x = evt.clientX, y = evt.clientY;
    var r = cible.getBoundingClientRect();
    var fly = document.createElement('div');
    fly.className = 'fly-burger'; fly.textContent = '🍔';
    fly.style.left = x + 'px'; fly.style.top = y + 'px';
    fly.style.setProperty('--mx', ((r.left - x) * 0.5) + 'px');
    fly.style.setProperty('--my-mid', '-120px');
    fly.style.setProperty('--dx', (r.left - x) + 'px');
    fly.style.setProperty('--dy', (r.top - y) + 'px');
    document.body.appendChild(fly);
    setTimeout(function () { fly.remove(); pulsePanier(); }, 780);
  }
  function pulsePanier() {
    var c = document.getElementById('panier-icone');
    if (!c) { return; }
    c.classList.add('panier-pulse');
    setTimeout(function () { c.classList.remove('panier-pulse'); }, 350);
  }

  function majPanierCount() {
    var el = document.getElementById('panier-count');
    if (el) { el.textContent = MB.nbArticlesPanier(); }
  }

  /* =====================================================
     CHECKOUT — tunnel 3 etapes + paiement MoMo simule
     ===================================================== */
  var modeService = 'livraison';

  function initCheckout() {
    var panier = MB.getPanier();
    if (!panier.length) { MB.toast('Votre panier est vide'); setTimeout(function () { location.href = 'index.html'; }, 1200); return; }

    // Recapitulatif
    var recap = document.getElementById('recap-articles');
    recap.innerHTML = panier.map(function (a) {
      return '<div class="recap-ligne"><span>' + a.qte + '× ' + a.nom + '</span><span>' + MB.formatPrix(a.prix * a.qte) + '</span></div>';
    }).join('');
    document.getElementById('recap-total').textContent = MB.formatPrix(MB.totalPanier());
    document.getElementById('btn-montant').textContent = MB.formatPrix(MB.totalPanier());

    // Mode de service
    document.querySelectorAll('.radio-card[data-mode]').forEach(function (c) {
      c.addEventListener('click', function () {
        document.querySelectorAll('.radio-card[data-mode]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif');
        modeService = c.getAttribute('data-mode');
        document.getElementById('champ-adresse').style.display = modeService === 'livraison' ? 'flex' : 'none';
      });
    });

    // Operateurs MoMo selon la ville
    var ville = MB.getVille();
    var ops = ville === 'brazza' ? ['MTN Money', 'Airtel Money'] : ['Togocom', 'Moov Money'];
    document.getElementById('c-operateur').innerHTML = ops.map(function (o) { return '<option>' + o + '</option>'; }).join('');

    // Navigation entre etapes
    document.getElementById('vers-2').addEventListener('click', function () { MB.jouerSon('click'); allerEtape(2); });
    document.getElementById('retour-1').addEventListener('click', function () { allerEtape(1); });
    document.getElementById('vers-3').addEventListener('click', function () {
      MB.jouerSon('click');
      if (!document.getElementById('c-prenom').value || !document.getElementById('c-tel').value) { MB.toast('Renseignez vos coordonnees'); return; }
      allerEtape(3);
    });
    document.getElementById('payer').addEventListener('click', payer);
  }

  function allerEtape(n) {
    document.querySelectorAll('.panneau').forEach(function (p) { p.classList.toggle('actif', p.getAttribute('data-panneau') == n); });
    document.querySelectorAll('.step').forEach(function (s) {
      var v = Number(s.getAttribute('data-step'));
      s.classList.toggle('actif', v === n);
      s.classList.toggle('fait', v < n);
    });
  }

  function payer() {
    if (!document.getElementById('c-momo').value) { MB.toast('Saisissez votre numero Mobile Money'); return; }
    // 🔊 SON : click.mp3
    MB.jouerSon('click');
    document.getElementById('zone-paiement').style.display = 'none';
    document.getElementById('zone-spinner').style.display = 'block';

    // Spinner 2s -> confirmation
    setTimeout(function () {
      var num = MB.genererNumeroCommande();
      var commande = {
        id: num,
        articles: MB.getPanier(),
        total: MB.totalPanier(),
        ville: MB.getVille(),
        devise: MB.getDevise(),
        mode: modeService,
        client: {
          prenom: document.getElementById('c-prenom').value,
          tel: document.getElementById('c-tel').value,
          adresse: document.getElementById('c-adresse').value
        },
        heure: Date.now()
      };
      MB.sauvegarderCommande(commande);
      localStorage.setItem('commande_active', num);
      MB.viderPanier();
      // 🔊 SON : success.mp3
      MB.jouerSon('success');
      MB.transitionVers('tracking.html');
    }, 2000);
  }

  /* =====================================================
     TRACKING — suivi 4 etapes + polling 2s
     ===================================================== */
  var ETAPES = [
    { cle: 'recue', label: 'Commande recue', sub: 'Nous avons bien recu votre commande' },
    { cle: 'cuisine', label: 'En cuisine', sub: 'Nos chefs preparent votre commande' },
    { cle: 'prete', label: 'Prete', sub: 'Votre commande est prete' },
    { cle: 'livraison', label: 'En livraison / Au comptoir', sub: 'En route ou disponible au comptoir' }
  ];

  function initTracking() {
    var id = localStorage.getItem('commande_active');
    var commande = MB.getCommandes().filter(function (c) { return c.id === id; })[0];
    if (!commande) { document.getElementById('track-num').textContent = 'Aucune commande active'; return; }

    document.getElementById('track-num').textContent = commande.id;
    document.getElementById('track-contenu').innerHTML = commande.articles.map(function (a) {
      return '<div class="recap-ligne"><span>' + a.qte + '× ' + a.nom + '</span><span>' + MB.formatPrix(a.prix * a.qte) + '</span></div>';
    }).join('') + '<div class="recap-total"><span>Total</span><span>' + MB.formatPrix(commande.total) + '</span></div>';

    // Polling centralise : relit le statut ecrit par le KDS
    MB.abonnerPolling(function () { rendreEtapes(id); });
  }

  function rendreEtapes(id) {
    var statut = MB.getStatutCommande(id);
    var idx = ETAPES.map(function (e) { return e.cle; }).indexOf(statut);
    if (idx < 0) { idx = 0; }
    document.getElementById('track-etapes').innerHTML = ETAPES.map(function (e, i) {
      var cls = i < idx ? 'atteinte' : (i === idx ? 'atteinte courante' : '');
      var coche = i < idx ? '✓' : (i === idx ? '●' : (i + 1));
      return '<div class="track-etape ' + cls + '"><div class="track-puce">' + coche + '</div>' +
        '<div><div class="track-label">' + e.label + '</div><div class="track-sub">' + e.sub + '</div></div></div>';
    }).join('');
    document.getElementById('track-info').textContent = 'Mise a jour automatique toutes les 2 secondes.';
  }

  /* =====================================================
     FRANCHISE — tunnel 4 etapes + confetti + success
     ===================================================== */
  var fData = { budget: '', exp: 'non' };

  function initFranchise() {
    // Navigation
    document.querySelectorAll('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () { MB.jouerSon('click'); allerPanneauF(Number(b.getAttribute('data-next'))); });
    });
    document.querySelectorAll('[data-prev]').forEach(function (b) {
      b.addEventListener('click', function () { allerPanneauF(Number(b.getAttribute('data-prev'))); });
    });
    // Ville libre
    document.getElementById('f-ville').addEventListener('change', function (e) {
      document.getElementById('champ-ville-libre').style.display = e.target.value === 'autre' ? 'flex' : 'none';
    });
    // Budget
    document.querySelectorAll('.radio-card[data-budget]').forEach(function (c) {
      c.addEventListener('click', function () {
        document.querySelectorAll('.radio-card[data-budget]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif'); fData.budget = c.getAttribute('data-budget');
      });
    });
    // Experience
    document.querySelectorAll('.radio-card[data-exp]').forEach(function (c) {
      c.addEventListener('click', function () {
        document.querySelectorAll('.radio-card[data-exp]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif'); fData.exp = c.getAttribute('data-exp');
        document.getElementById('champ-exp-detail').style.display = fData.exp === 'oui' ? 'flex' : 'none';
      });
    });
    document.getElementById('f-soumettre').addEventListener('click', soumettreFranchise);
  }

  function allerPanneauF(n) {
    document.querySelectorAll('.panneau').forEach(function (p) { p.classList.toggle('actif', p.getAttribute('data-panneau') == n); });
    document.querySelectorAll('.step').forEach(function (s) {
      var v = Number(s.getAttribute('data-step'));
      s.classList.toggle('actif', v === n);
      s.classList.toggle('fait', v < n);
    });
  }

  function soumettreFranchise() {
    var villeSel = document.getElementById('f-ville').value;
    var ville = villeSel === 'autre' ? (document.getElementById('f-ville-libre').value || 'Non precisee') : villeSel;
    if (!document.getElementById('f-prenom').value || !document.getElementById('f-nom').value || !fData.budget) {
      MB.toast('Completez votre profil et votre budget'); return;
    }
    var demande = {
      prenom: document.getElementById('f-prenom').value,
      nom: document.getElementById('f-nom').value,
      email: document.getElementById('f-email').value,
      whatsapp: document.getElementById('f-whatsapp').value,
      ville: ville,
      superficie: document.getElementById('f-superficie').value,
      budget: fData.budget,
      // Marque les gros budgets comme Fort Potentiel
      fortPotentiel: fData.budget === '>25M',
      experience: fData.exp,
      expDetail: document.getElementById('f-exp-detail').value,
      date: new Date().toISOString()
    };
    MB.ajouterFranchiseDemande(demande);
    // 🔊 SON : success.mp3
    MB.jouerSon('success');
    lancerConfetti();
    MB.toast('Demande envoyee ! Nous vous recontactons bientot.');
  }

  /* Effet confetti premium (respecte prefers-reduced-motion) */
  function lancerConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
    var couleurs = ['#F2B705', '#038C3E', '#BF0404', '#F7F7F5'];
    for (var i = 0; i < 80; i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = couleurs[i % couleurs.length];
      c.style.animationDuration = (1.8 + Math.random() * 1.5) + 's';
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 3500); })(c);
    }
  }

  /* --- Exposition --- */
  window.Client = {
    initMenu: initMenu,
    rafraichirRuptures: rafraichirRuptures,
    majPanierCount: majPanierCount,
    initCheckout: initCheckout,
    initTracking: initTracking,
    initFranchise: initFranchise
  };
})();
