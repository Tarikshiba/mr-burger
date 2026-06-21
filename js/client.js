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
      { id: 'chilli', nom: 'Chilli', prix: 3500, combo: true },
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
  var SUPP_COMBO = 2000;

  /* Degrades thematiques pour les photos placeholder */
  var GRADS = [
    'linear-gradient(135deg,#7a3b00,#1a0d00)',
    'linear-gradient(135deg,#5a0000,#1a0000)',
    'linear-gradient(135deg,#003d1a,#001a0d)',
    'linear-gradient(135deg,#5a4a00,#1a1500)',
    'linear-gradient(135deg,#3a3a3a,#111)'
  ];

  function trouverItem(id) {
    for (var i = 0; i < MENU.length; i++) {
      var it = MENU[i].items.filter(function (x) { return x.id === id; })[0];
      if (it) { return it; }
    }
    return null;
  }

  /* --- ONGLETS CATEGORIES --- */
  function initCatTabs() {
    var tabs = document.getElementById('cat-tabs');
    if (!tabs) { return; }
    // Onglet "Tous" + un par categorie
    var html = '<button class="cat-tab actif" data-cat="tous">Tous</button>';
    MENU.forEach(function (groupe) {
      html += '<button class="cat-tab" data-cat="' + groupe.cat + '">' + groupe.cat + '</button>';
    });
    tabs.innerHTML = html;

    tabs.querySelectorAll('.cat-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        // 🔊 SON : click.mp3
        MB.jouerSon('click');
        tabs.querySelectorAll('.cat-tab').forEach(function (t) { t.classList.remove('actif'); });
        tab.classList.add('actif');
        filtrerCategorie(tab.getAttribute('data-cat'));
      });
    });
  }

  function filtrerCategorie(cat) {
    var sections = document.querySelectorAll('.menu-cat-section');
    sections.forEach(function (section) {
      if (cat === 'tous') {
        section.style.display = '';
      } else {
        section.style.display = section.getAttribute('data-cat') === cat ? '' : 'none';
      }
    });
  }

  /* --- RENDU DU MENU --- */
  function initMenu() {
    var root = document.getElementById('menu');
    if (!root) { return; }
    var html = '';
    var g = 0;
    MENU.forEach(function (groupe) {
      html += '<section class="menu-cat-section" data-cat="' + groupe.cat + '">';
      html += '<h2 class="menu-cat-titre">' + groupe.cat + '</h2><div class="menu-grid">';
      groupe.items.forEach(function (it) {
        var grad = GRADS[(g++) % GRADS.length];
        var badge = it.extreme ? '<span class="badge badge-extreme">Extreme</span>' : '';
        var flamme = it.flamme ? '<span class="flamme">🔥</span> ' : '';
        html += '' +
          '<div class="carte-article" id="carte-' + it.id + '">' +
            '<div class="carte-photo" style="--photo-grad:' + grad + '"></div>' +
            '<div class="carte-body">' +
              '<div class="carte-nom">' + flamme + it.nom + ' <span class="badge-slot">' + badge + '</span></div>' +
              '<div class="carte-detail">' + (it.detail || '') + '</div>' +
              '<div class="carte-prix">' + MB.formatPrix(it.prix) + '</div>' +
              '<div class="carte-actions">' +
                '<button class="btn btn-ajouter" data-id="' + it.id + '">Ajouter</button>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
      html += '</div></section>';
    });
    root.innerHTML = html;

    // Branche les boutons Ajouter
    root.querySelectorAll('.btn-ajouter').forEach(function (btn) {
      btn.addEventListener('click', function (e) { ajouterAuPanier(btn.getAttribute('data-id'), e); });
    });

    // Initialise les onglets et la modale combo
    initCatTabs();
    initModaleCombo();
    rafraichirRuptures();
    majFooterPanier();
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

  /* --- MODALE COMBO (configurateur de formule) --- */
  var modaleItem = null;
  var modaleEvt = null;

  function ouvrirModaleCombo(id, evt) {
    var it = trouverItem(id);
    if (!it) { return; }
    modaleItem = it;
    modaleEvt = evt;

    var overlay = document.getElementById('modale-combo');
    if (!overlay) { return; }

    // Remplir les infos
    document.getElementById('modale-nom-article').textContent = it.nom;
    document.getElementById('prix-seul').textContent = MB.formatPrix(it.prix);
    document.getElementById('prix-combo').textContent = '+ ' + MB.formatPrix(SUPP_COMBO);

    // Reset : afficher etape 1, cacher etape 2
    document.getElementById('combo-etape-1').style.display = '';
    document.getElementById('combo-etape-2').classList.remove('visible');

    // Ouvrir
    overlay.classList.add('ouverte');
  }

  function fermerModale() {
    var overlay = document.getElementById('modale-combo');
    if (overlay) { overlay.classList.remove('ouverte'); }
    modaleItem = null;
    modaleEvt = null;
  }

  function initModaleCombo() {
    var overlay = document.getElementById('modale-combo');
    if (!overlay) { return; }

    // Fermer en cliquant l'overlay ou le X
    document.getElementById('modale-fermer').addEventListener('click', fermerModale);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { fermerModale(); }
    });

    // Choix "Burger seul"
    document.getElementById('choix-seul').addEventListener('click', function () {
      MB.jouerSon('click');
      ajouterDirectAuPanier(modaleItem.id, modaleItem.nom, modaleItem.prix, false);
      fermerModale();
    });

    // Choix "Formule Combo" -> sous-etape
    document.getElementById('choix-combo').addEventListener('click', function () {
      MB.jouerSon('click');
      document.getElementById('combo-etape-1').style.display = 'none';
      document.getElementById('combo-etape-2').classList.add('visible');
    });

    // Retour depuis sous-etape
    document.getElementById('combo-retour').addEventListener('click', function () {
      document.getElementById('combo-etape-2').classList.remove('visible');
      document.getElementById('combo-etape-1').style.display = '';
    });

    // Valider combo
    document.getElementById('combo-valider').addEventListener('click', function () {
      MB.jouerSon('click');
      var accomp = document.getElementById('combo-accomp').value;
      var boisson = document.getElementById('combo-boisson').value;
      var nomCombo = modaleItem.nom + ' (Combo · ' + accomp + ' · ' + boisson + ')';
      ajouterDirectAuPanier(modaleItem.id + '-combo', nomCombo, modaleItem.prix + SUPP_COMBO, true);
      fermerModale();
    });
  }

  /* --- AJOUT AU PANIER + animation signature --- */
  function ajouterAuPanier(id, evt) {
    var it = trouverItem(id);
    if (!it || MB.estEnRupture(id)) { return; }

    // Si l'article est eligible combo, ouvrir la modale
    if (it.combo) {
      ouvrirModaleCombo(id, evt);
      return;
    }

    // Sinon ajout direct
    // 🔊 SON : cart-add.mp3
    MB.jouerSon('cart-add');
    ajouterDirectAuPanier(id, it.nom, it.prix, false);
    animerVol(evt);
  }

  function ajouterDirectAuPanier(key, nom, prix, estCombo) {
    // 🔊 SON : cart-add.mp3
    MB.jouerSon('cart-add');
    var panier = MB.getPanier();
    var existe = panier.filter(function (a) { return a.key === key; })[0];
    if (existe) { existe.qte += 1; }
    else { panier.push({ key: key, id: key.replace('-combo', ''), nom: nom, prix: prix, qte: 1 }); }
    MB.setPanier(panier);
    majPanierCount();
    majFooterPanier();
    animerVol(modaleEvt);
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

  /* --- FOOTER PANIER FIXE --- */
  function majFooterPanier() {
    var footer = document.getElementById('panier-footer');
    if (!footer) { return; }
    var nb = MB.nbArticlesPanier();
    var total = MB.totalPanier();
    if (nb > 0) {
      footer.classList.add('visible');
    } else {
      footer.classList.remove('visible');
    }
    var countEl = document.getElementById('footer-count');
    var totalEl = document.getElementById('footer-total');
    var btnCheckout = document.getElementById('footer-checkout');
    if (countEl) { countEl.textContent = nb; }
    if (totalEl) { totalEl.textContent = MB.formatPrix(total); }
    if (btnCheckout) { btnCheckout.disabled = nb === 0; }
  }

  /* =====================================================
     CHECKOUT — tunnel 3 etapes + paiement MoMo simule
     ===================================================== */
  var modeService = 'livraison';
  var modePaiement = 'momo';
  var operateurChoisi = '';

  /* Couleurs pour les operateurs */
  var COULEURS_OPS = {
    'MTN Money': '#ffcc00',
    'Airtel Money': '#e40000',
    'Togocom': '#00a651',
    'Moov Money': '#0066b3'
  };

  function initCheckout() {
    var panier = MB.getPanier();
    if (!panier.length) { MB.toast('Votre panier est vide'); setTimeout(function () { location.href = 'index.html'; }, 1200); return; }

    rendreRecap();

    // Mode de service
    document.querySelectorAll('.mode-card[data-mode]').forEach(function (c) {
      c.addEventListener('click', function () {
        MB.jouerSon('click');
        document.querySelectorAll('.mode-card[data-mode]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif');
        modeService = c.getAttribute('data-mode');
        document.getElementById('champ-adresse').style.display = modeService === 'livraison' ? 'flex' : 'none';
        var champTable = document.getElementById('champ-table');
        if (champTable) { champTable.style.display = modeService === 'surplace' ? 'flex' : 'none'; }
      });
    });

    // Operateurs MoMo selon la ville (boutons visuels)
    var ville = MB.getVille();
    var ops = ville === 'brazza' ? ['MTN Money', 'Airtel Money'] : ['Togocom', 'Moov Money'];
    operateurChoisi = ops[0];
    var grille = document.getElementById('operateurs-grid');
    grille.innerHTML = ops.map(function (o, i) {
      var couleur = COULEURS_OPS[o] || 'var(--or)';
      return '<div class="operateur-card' + (i === 0 ? ' actif' : '') + '" data-op="' + o + '">' +
        '<div class="operateur-card-color" style="background:' + couleur + ';"></div>' +
        '<span class="operateur-card-nom">' + o + '</span>' +
      '</div>';
    }).join('');
    grille.querySelectorAll('.operateur-card').forEach(function (card) {
      card.addEventListener('click', function () {
        MB.jouerSon('click');
        grille.querySelectorAll('.operateur-card').forEach(function (x) { x.classList.remove('actif'); });
        card.classList.add('actif');
        operateurChoisi = card.getAttribute('data-op');
      });
    });

    // Navigation entre etapes
    document.getElementById('vers-2').addEventListener('click', function () {
      MB.jouerSon('click');
      if (!MB.getPanier().length) { MB.toast('Votre panier est vide'); return; }
      allerEtape(2);
    });
    document.getElementById('retour-1').addEventListener('click', function () { allerEtape(1); });
    document.getElementById('vers-3').addEventListener('click', function () {
      MB.jouerSon('click');
      if (!document.getElementById('c-prenom').value || !document.getElementById('c-tel').value) { MB.toast('Renseignez vos coordonnees'); return; }
      allerEtape(3);
    });
    // Mode de paiement (momo vs comptoir)
    document.querySelectorAll('[data-paiement]').forEach(function (c) {
      c.addEventListener('click', function () {
        MB.jouerSon('click');
        document.querySelectorAll('[data-paiement]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif');
        modePaiement = c.getAttribute('data-paiement');
        var zoneMomo = document.getElementById('zone-momo');
        if (zoneMomo) { zoneMomo.style.display = modePaiement === 'momo' ? '' : 'none'; }
        // Changer le texte du bouton
        var btnPayer = document.getElementById('payer');
        if (btnPayer) {
          if (modePaiement === 'comptoir') {
            btnPayer.innerHTML = 'Confirmer la commande';
          } else {
            btnPayer.innerHTML = 'Payer <span id="btn-montant">' + MB.formatPrix(MB.totalPanier()) + '</span>';
          }
        }
      });
    });

    document.getElementById('payer').addEventListener('click', ouvrirConfirmation);

    // Modale confirmation
    document.getElementById('confirm-annuler').addEventListener('click', fermerConfirmation);
    document.getElementById('confirm-oui').addEventListener('click', lancerPaiement);
    document.getElementById('confirm-overlay').addEventListener('click', function (e) {
      if (e.target === document.getElementById('confirm-overlay')) { fermerConfirmation(); }
    });
  }

  /* Rendu du recapitulatif panier avec controles +/- et suppression */
  function rendreRecap() {
    var panier = MB.getPanier();
    var recap = document.getElementById('recap-articles');
    if (!recap) { return; }

    if (!panier.length) {
      recap.innerHTML = '<div class="panier-vide"><div class="panier-vide-icone">🛒</div><p>Votre panier est vide</p><a href="index.html" class="btn">Retour au menu</a></div>';
      document.getElementById('recap-total').textContent = MB.formatPrix(0);
      var btnMontant = document.getElementById('btn-montant');
      if (btnMontant) { btnMontant.textContent = MB.formatPrix(0); }
      return;
    }

    recap.innerHTML = panier.map(function (a, idx) {
      return '<div class="recap-item">' +
        '<div class="recap-item-info">' +
          '<div class="recap-item-nom">' + a.nom + '</div>' +
          '<div class="recap-item-prix">' + MB.formatPrix(a.prix) + ' / unité</div>' +
        '</div>' +
        '<div class="recap-item-controls">' +
          (a.qte <= 1
            ? '<button class="qty-btn suppr" data-action="suppr" data-idx="' + idx + '">✕</button>'
            : '<button class="qty-btn" data-action="moins" data-idx="' + idx + '">−</button>') +
          '<span class="qty-val">' + a.qte + '</span>' +
          '<button class="qty-btn" data-action="plus" data-idx="' + idx + '">+</button>' +
        '</div>' +
      '</div>';
    }).join('');

    document.getElementById('recap-total').textContent = MB.formatPrix(MB.totalPanier());
    var btnMontant = document.getElementById('btn-montant');
    if (btnMontant) { btnMontant.textContent = MB.formatPrix(MB.totalPanier()); }

    // Branche les boutons quantite
    recap.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MB.jouerSon('click');
        var idx = Number(btn.getAttribute('data-idx'));
        var action = btn.getAttribute('data-action');
        var panier = MB.getPanier();
        if (action === 'plus') {
          panier[idx].qte += 1;
        } else if (action === 'moins') {
          panier[idx].qte -= 1;
          if (panier[idx].qte <= 0) { panier.splice(idx, 1); }
        } else if (action === 'suppr') {
          panier.splice(idx, 1);
        }
        MB.setPanier(panier);
        rendreRecap();
      });
    });
  }

  function allerEtape(n) {
    document.querySelectorAll('.panneau').forEach(function (p) { p.classList.toggle('actif', p.getAttribute('data-panneau') == n); });
    document.querySelectorAll('.step').forEach(function (s) {
      var v = Number(s.getAttribute('data-step'));
      s.classList.toggle('actif', v === n);
      s.classList.toggle('fait', v < n);
    });
  }

  /* Modale de confirmation avant paiement */
  function ouvrirConfirmation() {
    if (modePaiement === 'momo' && !document.getElementById('c-momo').value) {
      MB.toast('Saisissez votre numero Mobile Money'); return;
    }
    MB.jouerSon('click');
    document.getElementById('confirm-montant').textContent = MB.formatPrix(MB.totalPanier());
    document.getElementById('confirm-overlay').classList.add('ouverte');
  }
  function fermerConfirmation() {
    document.getElementById('confirm-overlay').classList.remove('ouverte');
  }

  function lancerPaiement() {
    fermerConfirmation();
    document.getElementById('zone-paiement').style.display = 'none';
    document.getElementById('zone-spinner').style.display = 'block';

    setTimeout(function () {
      var num = MB.genererNumeroCommande();
      var commande = {
        id: num,
        articles: MB.getPanier(),
        total: MB.totalPanier(),
        ville: MB.getVille(),
        devise: MB.getDevise(),
        mode: modeService,
        paiement: modePaiement,
        operateur: modePaiement === 'momo' ? operateurChoisi : 'comptoir',
        client: {
          prenom: document.getElementById('c-prenom').value,
          tel: document.getElementById('c-tel').value,
          adresse: document.getElementById('c-adresse').value,
          table: document.getElementById('c-table') ? document.getElementById('c-table').value : ''
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
    if (!commande) {
      afficherAucuneCommande();
      return;
    }

    // Si la commande est deja livree, afficher "Bon appetit"
    var statut = MB.getStatutCommande(id);
    if (statut === 'livraison') {
      afficherBonAppetit(commande);
      return;
    }

    document.getElementById('track-num').textContent = commande.id;

    // QR Code si paiement MoMo
    afficherQR(commande);

    document.getElementById('track-contenu').innerHTML = commande.articles.map(function (a) {
      return '<div class="recap-ligne"><span>' + a.qte + '× ' + a.nom + '</span><span>' + MB.formatPrix(a.prix * a.qte) + '</span></div>';
    }).join('') + '<div class="recap-total"><span>Total</span><span>' + MB.formatPrix(commande.total) + '</span></div>' +
    '<button class="btn-recu" id="btn-recu" style="display:none;">📄 Télécharger le reçu</button>';

    // Polling centralise : relit le statut ecrit par le KDS
    MB.abonnerPolling(function () {
      var s = MB.getStatutCommande(id);
      if (s === 'livraison') {
        afficherBonAppetit(commande);
        return;
      }
      rendreEtapes(id);
    });
  }

  function afficherAucuneCommande() {
    var wrap = document.querySelector('.track-wrap');
    if (!wrap) { return; }
    wrap.innerHTML = '<div style="text-align:center;padding:4rem 2rem;">' +
      '<div style="font-size:4rem;margin-bottom:1rem;opacity:.5;">📋</div>' +
      '<h2 class="titre" style="margin-bottom:.5rem;">Aucune commande active</h2>' +
      '<p style="color:var(--gris);margin-bottom:1.5rem;">Passez une commande pour suivre sa progression ici.</p>' +
      '<a href="index.html" class="btn">Commander</a></div>';
  }

  function afficherBonAppetit(commande) {
    var wrap = document.querySelector('.track-wrap');
    if (!wrap) { return; }
    var articles = commande.articles.map(function (a) {
      return '<div class="recap-ligne"><span>' + a.qte + '× ' + a.nom + '</span><span>' + MB.formatPrix(a.prix * a.qte) + '</span></div>';
    }).join('');
    wrap.innerHTML = '<div class="bon-appetit">' +
      '<div class="bon-appetit-icone">🍔</div>' +
      '<h2 class="titre">Bon appétit !</h2>' +
      '<p>Votre commande <strong>' + commande.id + '</strong> a été livrée.</p>' +
      '</div>' +
      '<div class="track-recap" style="margin-top:2rem;">' +
        '<p style="font-weight:600;margin-bottom:.8rem;color:var(--gris-clair);">Résumé de commande</p>' +
        articles +
        '<div class="recap-total"><span>Total payé</span><span>' + MB.formatPrix(commande.total) + '</span></div>' +
      '</div>' +
      '<div style="text-align:center;margin-top:2rem;display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">' +
        '<a href="index.html" class="btn">← Retour au menu</a>' +
        '<a href="index.html" class="btn btn-ghost">Nouvelle commande</a>' +
      '</div>';
    // Nettoyer la commande active
    localStorage.removeItem('commande_active');
  }

  function rendreEtapes(id) {
    var statut = MB.getStatutCommande(id);
    var idx = ETAPES.map(function (e) { return e.cle; }).indexOf(statut);
    if (idx < 0) { idx = 0; }

    // Barre de progression lumineuse
    var progress = document.getElementById('track-progress');
    if (progress) {
      var pct = Math.round(((idx + 1) / ETAPES.length) * 100);
      progress.style.width = pct + '%';
    }

    // Timeline
    document.getElementById('track-etapes').innerHTML = ETAPES.map(function (e, i) {
      var cls = i < idx ? 'atteinte' : (i === idx ? 'atteinte courante' : '');
      var coche = i < idx ? '✓' : (i === idx ? '●' : (i + 1));
      return '<div class="track-etape ' + cls + '"><div class="track-puce">' + coche + '</div>' +
        '<div><div class="track-label">' + e.label + '</div><div class="track-sub">' + e.sub + '</div></div></div>';
    }).join('');

    // Statut textuel
    var labelEl = document.getElementById('track-status-label');
    if (labelEl) { labelEl.textContent = ETAPES[idx].label; }
    document.getElementById('track-info').textContent = 'Mise a jour automatique toutes les 2 secondes.';

    // Afficher les boutons d'action quand la commande est a la derniere etape
    var actions = document.getElementById('track-actions');
    if (actions) {
      actions.style.display = (idx === ETAPES.length - 1) ? 'flex' : 'none';
    }

    // QR visible tant que statut est "recue", cache apres (= paiement simule fait)
    var qrSection = document.getElementById('qr-section');
    if (qrSection) { qrSection.style.display = idx >= 1 ? 'none' : ''; }

    // Bouton recu visible des que la commande passe en cuisine (= paiement confirme)
    var btnRecu = document.getElementById('btn-recu');
    if (btnRecu) {
      btnRecu.style.display = idx >= 1 ? '' : 'none';
      if (!btnRecu._bound) {
        btnRecu._bound = true;
        btnRecu.addEventListener('click', function () {
          var cmd = MB.getCommandes().filter(function (c) { return c.id === id; })[0];
          if (cmd) { genererRecu(cmd); }
        });
      }
    }
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
      b.addEventListener('click', function () { MB.jouerSon('click'); allerPanneauF(Number(b.getAttribute('data-prev'))); });
    });
    // Ville libre
    document.getElementById('f-ville').addEventListener('change', function (e) {
      document.getElementById('champ-ville-libre').style.display = e.target.value === 'autre' ? 'flex' : 'none';
    });
    // Budget (nouvelles budget-cards)
    document.querySelectorAll('.budget-card[data-budget]').forEach(function (c) {
      c.addEventListener('click', function () {
        MB.jouerSon('click');
        document.querySelectorAll('.budget-card[data-budget]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif');
        fData.budget = c.getAttribute('data-budget');
        // Afficher badge Fort Potentiel si > 25M
        var badge = document.getElementById('badge-potentiel');
        if (badge) {
          if (fData.budget === '>25M') { badge.classList.add('visible'); }
          else { badge.classList.remove('visible'); }
        }
      });
    });
    // Experience (nouvelles exp-cards)
    document.querySelectorAll('.exp-card[data-exp]').forEach(function (c) {
      c.addEventListener('click', function () {
        MB.jouerSon('click');
        document.querySelectorAll('.exp-card[data-exp]').forEach(function (x) { x.classList.remove('actif'); });
        c.classList.add('actif');
        fData.exp = c.getAttribute('data-exp');
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
      fortPotentiel: fData.budget === '>25M',
      experience: fData.exp,
      expDetail: document.getElementById('f-exp-detail').value,
      date: new Date().toISOString()
    };
    MB.ajouterFranchiseDemande(demande);
    // 🔊 SON : success.mp3
    MB.jouerSon('success');
    lancerConfetti();

    // Afficher l'ecran de succes
    document.querySelectorAll('.panneau').forEach(function (p) { p.classList.remove('actif'); });
    document.querySelector('.steps').style.display = 'none';
    var succes = document.getElementById('franchise-succes');
    if (succes) { succes.classList.add('visible'); }
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

  /* --- QR CODE (maquette — encode les infos commande) --- */
  function afficherQR(commande) {
    // Afficher le QR seulement si paiement momo (ou pas defini = ancien format = momo par defaut)
    if (commande.paiement === 'comptoir') { return; }
    var progressBar = document.querySelector('.track-progress-bar');
    if (!progressBar) { return; }

    var qrSection = document.createElement('div');
    qrSection.className = 'qr-section';
    qrSection.id = 'qr-section';
    qrSection.innerHTML = '<h3>Scannez pour payer</h3>' +
      '<p>Scannez ce QR code avec votre application ' + (commande.operateur || 'Mobile Money') + '</p>' +
      '<div class="qr-canvas" id="qr-el"></div>' +
      '<div><span class="qr-operateur" id="qr-op-badge">' + (commande.operateur || 'Mobile Money') + '</span></div>';

    // Inserer apres la barre de progression
    progressBar.parentNode.insertBefore(qrSection, progressBar.nextSibling);

    // Couleur du badge operateur
    var COULEURS = { 'MTN Money': '#ffcc00', 'Airtel Money': '#e40000', 'Togocom': '#00a651', 'Moov Money': '#0066b3' };
    var opBadge = document.getElementById('qr-op-badge');
    var couleur = COULEURS[commande.operateur] || '#F2B705';
    opBadge.style.background = couleur;
    opBadge.style.color = couleur === '#ffcc00' ? '#1a1300' : '#fff';

    // Generer le QR code (lib qrcodejs : new QRCode(element, options))
    var qrData = 'MrBurger|' + commande.id + '|' + commande.total + (commande.devise || 'XOF') + '|' + (commande.operateur || '');
    var qrEl = document.getElementById('qr-el');
    if (typeof QRCode !== 'undefined' && qrEl) {
      new QRCode(qrEl, {
        text: qrData,
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  /* --- RECU CLIENT (telechargement HTML) --- */
  function genererRecu(commande) {
    var articles = commande.articles.map(function (a) {
      return '<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">' + a.qte + '× ' + a.nom + '</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">' + MB.formatPrix(a.prix * a.qte) + '</td></tr>';
    }).join('');
    var date = new Date(commande.heure).toLocaleString('fr-FR');
    var modePaiement = commande.paiement === 'comptoir' ? 'Au comptoir' : (commande.operateur || 'Mobile Money');

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"/>' +
      '<title>Recu Mr. Burger - ' + commande.id + '</title>' +
      '<style>body{font-family:"DM Sans",Arial,sans-serif;max-width:400px;margin:2rem auto;padding:1.5rem;color:#1a1a1a;}' +
      'h1{font-size:1.5rem;text-align:center;margin-bottom:.2rem;}' +
      '.sub{text-align:center;color:#666;font-size:.85rem;margin-bottom:1.5rem;}' +
      'table{width:100%;border-collapse:collapse;margin:1rem 0;}' +
      '.total{font-size:1.2rem;font-weight:700;border-top:2px solid #1a1a1a;padding-top:.8rem;margin-top:.5rem;}' +
      '.info{font-size:.85rem;color:#666;margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eee;}' +
      '.footer{text-align:center;margin-top:2rem;font-size:.8rem;color:#999;}</style></head><body>' +
      '<h1>Mr. Burger</h1>' +
      '<p class="sub">Recu de commande</p>' +
      '<p><strong>N° :</strong> ' + commande.id + '</p>' +
      '<p><strong>Date :</strong> ' + date + '</p>' +
      '<p><strong>Client :</strong> ' + commande.client.prenom + '</p>' +
      '<table>' + articles + '</table>' +
      '<div class="total">Total : ' + MB.formatPrix(commande.total) + '</div>' +
      '<div class="info">' +
        '<p><strong>Mode :</strong> ' + (commande.mode === 'livraison' ? 'Livraison' : 'Sur place') + '</p>' +
        '<p><strong>Paiement :</strong> ' + modePaiement + '</p>' +
      '</div>' +
      '<p class="footer">Merci pour votre commande !<br/>Mr. Burger — Toujours le meilleur.</p>' +
      '</body></html>';

    // Telecharger en tant que fichier HTML (le client peut ouvrir et enregistrer en PDF)
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'recu-' + commande.id + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    MB.toast('Recu telecharge !');
  }

  /* --- Exposition --- */
  window.Client = {
    initMenu: initMenu,
    rafraichirRuptures: rafraichirRuptures,
    majPanierCount: majPanierCount,
    majFooterPanier: majFooterPanier,
    initCheckout: initCheckout,
    initTracking: initTracking,
    initFranchise: initFranchise
  };
})();
