/* =========================================================
   MR. BURGER — STAFF.JS
   Logique login, KDS, dispatch et hub master.
   Depend de window.MrBurger (core.js).
   ========================================================= */
(function () {
  'use strict';
  var MB = window.MrBurger;

  /* --- Credentials de demo (en dur) --- */
  var COMPTES = {
    staff: { mdp: 'kitchen2024', role: 'staff', page: 'kds.html' },
    master: { mdp: 'mrboss2024', role: 'master', page: 'master.html' }
  };

  /* Liste fictive de livreurs */
  var LIVREURS = ['Junior K.', 'Aristide M.', 'Fatou D.', 'Komlan A.', 'Serge N.'];

  /* Catalogue d'articles/ingredients pour le module ruptures du KDS */
  var ARTICLES_RUPTURE = [
    { id: 'mozza-sticks', nom: 'Mozza Sticks' }, { id: 'chicken-pops', nom: 'Chicken Pops' },
    { id: 'crunchy-chicken', nom: 'Crunchy Chicken' }, { id: 'poulet-fries', nom: 'Poulet-Fries' },
    { id: 'mr-burger', nom: 'Mr Burger' }, { id: 'flaming-burger', nom: 'Flaming Burger' },
    { id: 'sizzling-burger', nom: 'Sizzling Burger' }, { id: 'cheese-classique', nom: 'Cheese Classique' },
    { id: 'chilli', nom: 'Chilli' }, { id: 'champii', nom: 'Champii' }, { id: 'bbq', nom: 'BBQ' },
    { id: 'zinger', nom: 'Zinger', }, { id: 'mexicaine', nom: 'Mexicaine' },
    { id: 'fish-burger', nom: 'Fish Burger' }, { id: 'kids-meal', nom: 'Kids Meal' },
    { id: 'nutella-burger', nom: 'Nutella Burger' }
  ];

  /* =====================================================
     LOGIN
     ===================================================== */
  function initLogin() {
    var btn = document.getElementById('btn-connexion');
    function tenter() {
      // 🔊 SON : click.mp3
      MB.jouerSon('click');
      var u = document.getElementById('login').value.trim();
      var p = document.getElementById('mdp').value;
      var compte = COMPTES[u];
      if (compte && compte.mdp === p) {
        localStorage.setItem('role', compte.role);
        MB.transitionVers(compte.page);
      } else {
        document.getElementById('erreur').textContent = 'Identifiants invalides.';
      }
    }
    btn.addEventListener('click', tenter);
    document.getElementById('mdp').addEventListener('keydown', function (e) { if (e.key === 'Enter') { tenter(); } });
  }

  function exigerRole(role) {
    var r = localStorage.getItem('role');
    if (role === 'master' && r !== 'master') { location.href = 'login.html'; return false; }
    if (!r) { location.href = 'login.html'; return false; }
    return true;
  }

  function brancherDeconnexion() {
    var b = document.getElementById('deconnexion');
    if (b) { b.addEventListener('click', function () { MB.jouerSon('click'); localStorage.removeItem('role'); MB.transitionVers('login.html'); }); }
  }

  /* =====================================================
     KDS — Kitchen Display System
     ===================================================== */
  var dejaVues = {}; // pour declencher kitchen-alert.mp3 sur les nouvelles commandes

  function initKDS() {
    if (!exigerRole('staff')) { return; }
    brancherDeconnexion();
    rendreRuptures();
    // Polling centralise : rafraichit les fiches et minuteurs toutes les 2s
    MB.abonnerPolling(rendreKDS);
  }

  function rendreKDS() {
    // Commandes non terminees (statut recue ou cuisine)
    var commandes = MB.getCommandes().filter(function (c) {
      var s = MB.getStatutCommande(c.id);
      return s === 'recue' || s === 'cuisine';
    });
    var grid = document.getElementById('kds-grid');

    // Detection des nouvelles commandes -> son d'alerte
    commandes.forEach(function (c) {
      if (!dejaVues[c.id]) {
        dejaVues[c.id] = true;
        // 🔊 SON : kitchen-alert.mp3
        MB.jouerSon('kitchen-alert');
      }
    });

    if (!commandes.length) { grid.innerHTML = '<p class="track-sub">Aucune commande en cours.</p>'; return; }

    grid.innerHTML = commandes.map(function (c) {
      var mins = Math.floor((Date.now() - c.heure) / 60000);
      var classeTimer = mins < 10 ? 'timer-vert' : (mins <= 15 ? 'timer-orange' : 'timer-rouge');
      var heure = new Date(c.heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      var articles = c.articles.map(function (a) { return '<li>' + a.qte + '× ' + a.nom + '</li>'; }).join('');
      var statut = MB.getStatutCommande(c.id);
      var btn = statut === 'recue'
        ? '<button class="btn" data-action="cuisine" data-id="' + c.id + '" style="width:100%;">Mettre en cuisine</button>'
        : '<button class="btn btn-vert" data-action="prete" data-id="' + c.id + '" style="width:100%;">Marquer Prete</button>';
      return '<div class="kds-fiche">' +
        '<h3 class="kds-num">' + c.id + '</h3>' +
        '<p class="track-sub">Passee a ' + heure + ' · ' + (c.mode === 'livraison' ? 'Livraison' : 'Sur place') + '</p>' +
        '<ul class="kds-articles">' + articles + '</ul>' +
        '<p class="kds-timer ' + classeTimer + '">⏱ ' + mins + ' min</p>' +
        btn +
        '</div>';
    }).join('');

    // Branche les boutons d'action
    grid.querySelectorAll('[data-action]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        var action = b.getAttribute('data-action');
        MB.setStatutCommande(id, action);
        // 🔊 SON : kitchen-alert.mp3
        MB.jouerSon('kitchen-alert');
        rendreKDS();
      });
    });
  }

  /* Module ruptures : bascule rupture_[id] (reflete cote client via polling) */
  function rendreRuptures() {
    var grid = document.getElementById('rupture-grid');
    grid.innerHTML = ARTICLES_RUPTURE.map(function (a) {
      var off = MB.estEnRupture(a.id);
      return '<div class="rupture-item ' + (off ? 'off' : '') + '" data-id="' + a.id + '">' +
        '<span>' + a.nom + '</span><span>' + (off ? 'Rupture' : 'Dispo') + '</span></div>';
    }).join('');
    grid.querySelectorAll('.rupture-item').forEach(function (el) {
      el.addEventListener('click', function () {
        // 🔊 SON : click.mp3
        MB.jouerSon('click');
        MB.basculerRupture(el.getAttribute('data-id'));
        rendreRuptures();
      });
    });
  }

  /* =====================================================
     DISPATCH — attribution des commandes pretes
     ===================================================== */
  function initDispatch() {
    if (!exigerRole('staff')) { return; }
    brancherDeconnexion();
    MB.abonnerPolling(rendreDispatch);
  }

  function rendreDispatch() {
    var pretes = MB.getCommandes().filter(function (c) { return MB.getStatutCommande(c.id) === 'prete'; });
    var grid = document.getElementById('dispatch-grid');
    if (!pretes.length) { grid.innerHTML = '<p class="track-sub">Aucune commande prete a attribuer.</p>'; return; }

    var options = LIVREURS.map(function (l) { return '<option>' + l + '</option>'; }).join('');
    grid.innerHTML = pretes.map(function (c) {
      return '<div class="kds-fiche">' +
        '<h3 class="kds-num">' + c.id + '</h3>' +
        '<p class="track-sub">' + (c.mode === 'livraison' ? 'Livraison — ' + (c.client.adresse || 'adresse non fournie') : 'Sur place') + '</p>' +
        '<div class="champ" style="margin:.8rem 0;"><label>Livreur</label><select class="sel-livreur">' + options + '</select></div>' +
        '<button class="btn btn-vert" data-id="' + c.id + '" style="width:100%;">Attribuer & expedier</button>' +
        '</div>';
    }).join('');

    grid.querySelectorAll('button[data-id]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        var sel = b.parentElement.querySelector('.sel-livreur');
        localStorage.setItem('livreur_' + id, sel.value);
        MB.setStatutCommande(id, 'livraison');
        // 🔊 SON : success.mp3
        MB.jouerSon('success');
        MB.toast('Commande ' + id + ' attribuee a ' + sel.value);
        rendreDispatch();
      });
    });
  }

  /* =====================================================
     MASTER — Analytics (Chart.js) + CRM Franchise
     ===================================================== */
  var BUDGET_LABELS = { '<10M': '< 10M FCFA', '10-25M': '10–25M FCFA', '>25M': '> 25M FCFA' };
  var dejaVuesFranchise = 0; // pour son notification sur nouvelle demande qualifiee

  function initMaster() {
    if (!exigerRole('master')) { return; }
    brancherDeconnexion();
    rendreKPIs();
    rendreCharts();
    rendreCRM();
    // Polling : detecte les nouvelles demandes Fort Potentiel
    MB.abonnerPolling(function () {
      var qualifiees = MB.getFranchiseDemandes().filter(function (d) { return d.fortPotentiel; }).length;
      if (dejaVuesFranchise && qualifiees > dejaVuesFranchise) {
        // 🔊 SON : notification.mp3
        MB.jouerSon('notification');
        MB.toast('Nouvelle demande Fort Potentiel !');
        rendreCRM();
      }
      dejaVuesFranchise = qualifiees;
    });
  }

  function donnees() {
    var commandes = MB.getCommandes();
    var caBrazza = 0, caLome = 0, temps = [], cats = {};
    var CAT_MAP = {
      'mr-burger': 'Specialites', 'flaming-burger': 'Specialites', 'sizzling-burger': 'Specialites',
      'cheese-classique': 'Boeuf', 'chilli': 'Boeuf', 'champii': 'Boeuf', 'mozza-crunchy': 'Boeuf', 'bbq': 'Boeuf',
      'chicken-cheese': 'Poulet', 'chicken-pesto': 'Poulet', 'zinger': 'Poulet', 'mexicaine': 'Poulet',
      'falafel': 'Vege', 'v-burger': 'Vege', 'fish-burger': 'Vege'
    };
    commandes.forEach(function (c) {
      if (c.ville === 'brazza') { caBrazza += c.total; } else { caLome += c.total; }
      c.articles.forEach(function (a) {
        var cat = CAT_MAP[a.id] || 'Autres';
        cats[cat] = (cats[cat] || 0) + a.qte;
      });
      // Temps de prep simule : ecart entre passage et maintenant, borne pour le proto
      temps.push(Math.max(5, Math.min(25, Math.floor((Date.now() - c.heure) / 60000))));
    });
    return { caBrazza: caBrazza, caLome: caLome, temps: temps, cats: cats, total: commandes.length };
  }

  function rendreKPIs() {
    var d = donnees();
    var ca = d.caBrazza + d.caLome;
    var html = '' +
      '<div class="kpi"><div class="val">' + MB.formatPrix(ca) + '</div><div class="lbl">CA total</div></div>' +
      '<div class="kpi"><div class="val">' + d.total + '</div><div class="lbl">Commandes</div></div>' +
      '<div class="kpi"><div class="val">' + MB.formatPrix(d.caBrazza) + '</div><div class="lbl">Brazzaville</div></div>' +
      '<div class="kpi"><div class="val">' + MB.formatPrix(d.caLome) + '</div><div class="lbl">Lome</div></div>';
    document.getElementById('kpis').innerHTML = html;
  }

  function rendreCharts() {
    var d = donnees();
    Chart.defaults.color = '#9A9A9A';
    Chart.defaults.font.family = 'DM Sans, sans-serif';

    // CA comparatif (barres)
    new Chart(document.getElementById('chart-ca'), {
      type: 'bar',
      data: { labels: ['Brazzaville', 'Lome'], datasets: [{ label: 'CA', data: [d.caBrazza, d.caLome], backgroundColor: ['#F2B705', '#038C3E'] }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Ventes par categorie (camembert)
    var labels = Object.keys(d.cats);
    new Chart(document.getElementById('chart-cat'), {
      type: 'pie',
      data: { labels: labels.length ? labels : ['Aucune donnee'], datasets: [{ data: labels.length ? labels.map(function (k) { return d.cats[k]; }) : [1], backgroundColor: ['#F2B705', '#038C3E', '#BF0404', '#e07b00', '#888'] }] }
    });

    // Temps moyen de prep (courbe)
    new Chart(document.getElementById('chart-temps'), {
      type: 'line',
      data: { labels: d.temps.map(function (_, i) { return '#' + (i + 1); }), datasets: [{ label: 'Minutes', data: d.temps, borderColor: '#F2B705', backgroundColor: 'rgba(242,183,5,.15)', tension: .35, fill: true }] },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }

  function rendreCRM() {
    var demandes = MB.getFranchiseDemandes();
    var body = document.getElementById('crm-body');
    if (!demandes.length) { body.innerHTML = '<tr><td colspan="6" class="track-sub">Aucune demande recue.</td></tr>'; return; }
    body.innerHTML = demandes.map(function (d) {
      var nom = d.prenom + ' ' + d.nom;
      var date = new Date(d.date).toLocaleDateString('fr-FR');
      var budget = BUDGET_LABELS[d.budget] || d.budget;
      var badge = d.fortPotentiel ? ' <span class="badge-or">Fort Potentiel</span>' : '';
      // URL WhatsApp pre-remplie personnalisee
      var msg = 'Bonjour ' + d.prenom + ', merci pour votre interet a ouvrir une franchise Mr. Burger a ' + d.ville + ' (budget ' + budget + '). Discutons de votre projet !';
      var tel = (d.whatsapp || '').replace(/[^0-9]/g, '');
      var wa = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg);
      return '<tr class="' + (d.fortPotentiel ? 'ligne-potentiel' : '') + '">' +
        '<td>' + nom + badge + '</td>' +
        '<td>' + d.ville + '</td>' +
        '<td>' + budget + '</td>' +
        '<td>' + (d.experience === 'oui' ? 'Oui' : 'Non') + '</td>' +
        '<td>' + date + '</td>' +
        '<td><a class="btn btn-vert" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a></td>' +
        '</tr>';
    }).join('');
  }

  /* --- Exposition --- */
  window.Staff = {
    initLogin: initLogin,
    initKDS: initKDS,
    initDispatch: initDispatch,
    initMaster: initMaster
  };
})();
