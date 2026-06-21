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
    var commandes = MB.getCommandes().filter(function (c) {
      var s = MB.getStatutCommande(c.id);
      return s === 'recue' || s === 'cuisine';
    });
    var grid = document.getElementById('kds-grid');

    // Compteur
    var countEl = document.getElementById('kds-count');
    if (countEl) { countEl.textContent = commandes.length + ' en cours'; }

    // Detection des nouvelles commandes -> son d'alerte
    commandes.forEach(function (c) {
      if (!dejaVues[c.id]) {
        dejaVues[c.id] = true;
        // 🔊 SON : kitchen-alert.mp3
        MB.jouerSon('kitchen-alert');
      }
    });

    if (!commandes.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gris);">' +
        '<div style="font-size:3rem;opacity:.4;margin-bottom:.8rem;">👨‍🍳</div>' +
        '<p>Aucune commande en cours</p></div>';
      return;
    }

    grid.innerHTML = commandes.map(function (c) {
      var mins = Math.floor((Date.now() - c.heure) / 60000);
      var classeTimer = mins < 10 ? 'timer-vert' : (mins <= 15 ? 'timer-orange' : 'timer-rouge');
      var classeBar = mins < 10 ? 'vert' : (mins <= 15 ? 'orange' : 'rouge');
      var heure = new Date(c.heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      var articles = c.articles.map(function (a) { return '<li><span>' + a.qte + '× ' + a.nom + '</span></li>'; }).join('');
      var statut = MB.getStatutCommande(c.id);
      var modeLabel = c.mode === 'livraison' ? '🛵 Livraison' : '🍽️ Sur place';
      var tableInfo = (c.client && c.client.table) ? ' · Table ' + c.client.table : '';
      var btn = statut === 'recue'
        ? '<button class="btn" data-action="cuisine" data-id="' + c.id + '">Mettre en cuisine</button>'
        : '<button class="btn btn-vert" data-action="prete" data-id="' + c.id + '">Marquer Prête ✓</button>';
      var btnFacture = '<button class="btn btn-ghost" data-facture="' + c.id + '" style="width:100%;margin-top:.5rem;padding:.7rem;font-size:.85rem;">🧾 Imprimer facture</button>';
      return '<div class="kds-fiche">' +
        '<div class="kds-fiche-progress"><div class="kds-fiche-progress-fill ' + classeBar + '"></div></div>' +
        '<div class="kds-fiche-header">' +
          '<h3>' + c.id + '</h3>' +
          '<span class="kds-fiche-mode">' + modeLabel + tableInfo + '</span>' +
        '</div>' +
        '<div class="kds-fiche-meta">' + heure + '</div>' +
        '<ul class="kds-articles">' + articles + '</ul>' +
        '<div class="kds-timer-wrap">' +
          '<span class="kds-timer ' + classeTimer + '">⏱ ' + mins + ' min</span>' +
        '</div>' +
        btn + btnFacture +
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
    // Branche les boutons facture
    grid.querySelectorAll('[data-facture]').forEach(function (b) {
      b.addEventListener('click', function () {
        MB.jouerSon('click');
        var id = b.getAttribute('data-facture');
        imprimerFacture(id);
      });
    });
  }

  /* Module ruptures : bascule rupture_[id] (reflete cote client via polling) */
  function rendreRuptures() {
    var grid = document.getElementById('rupture-grid');
    if (!grid) { return; }
    grid.innerHTML = ARTICLES_RUPTURE.map(function (a) {
      var off = MB.estEnRupture(a.id);
      return '<div class="rupture-item ' + (off ? 'off' : '') + '" data-id="' + a.id + '">' +
        '<span>' + a.nom + '</span>' +
        '<span class="rupture-badge">' + (off ? 'Rupture' : 'Dispo') + '</span></div>';
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
  var dispatchDerniereIds = '';

  function initDispatch() {
    if (!exigerRole('staff')) { return; }
    brancherDeconnexion();
    MB.abonnerPolling(function () {
      // Ne re-rendre que si la liste a change (evite de fermer le select en cours)
      var pretes = MB.getCommandes().filter(function (c) { return MB.getStatutCommande(c.id) === 'prete'; });
      var ids = pretes.map(function (c) { return c.id; }).join(',');
      if (ids !== dispatchDerniereIds) {
        dispatchDerniereIds = ids;
        rendreDispatch();
      }
    });
  }

  function rendreDispatch() {
    var pretes = MB.getCommandes().filter(function (c) { return MB.getStatutCommande(c.id) === 'prete'; });
    var grid = document.getElementById('dispatch-grid');

    // Compteur
    var countEl = document.getElementById('dispatch-count');
    if (countEl) { countEl.textContent = pretes.length + ' prete' + (pretes.length > 1 ? 's' : ''); }

    if (!pretes.length) {
      grid.innerHTML = '<div class="dispatch-empty" style="grid-column:1/-1;">' +
        '<div class="dispatch-empty-icone">📦</div>' +
        '<p>Aucune commande prête à attribuer</p></div>';
      return;
    }

    var options = LIVREURS.map(function (l) { return '<option>' + l + '</option>'; }).join('');
    grid.innerHTML = pretes.map(function (c) {
      var modeLabel = c.mode === 'livraison' ? '🛵 Livraison' : '🍽️ Sur place';
      var adresse = c.mode === 'livraison' ? (c.client.adresse || 'Adresse non fournie') : (c.client.table ? 'Table ' + c.client.table : 'Au comptoir');
      return '<div class="dispatch-fiche">' +
        '<div class="dispatch-fiche-header">' +
          '<h3>' + c.id + '</h3>' +
          '<span class="dispatch-fiche-mode">' + modeLabel + '</span>' +
        '</div>' +
        '<div class="dispatch-fiche-adresse">📍 ' + adresse + '</div>' +
        '<div class="dispatch-livreur-select">' +
          '<label>Attribuer à</label>' +
          '<select class="sel-livreur">' + options + '</select>' +
        '</div>' +
        '<button class="btn btn-vert" data-id="' + c.id + '">Expédier ✓</button>' +
        '</div>';
    }).join('');

    grid.querySelectorAll('button[data-id]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        var sel = b.closest('.dispatch-fiche').querySelector('.sel-livreur');
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
    var tempsMoyen = d.temps.length ? Math.round(d.temps.reduce(function (a, b) { return a + b; }, 0) / d.temps.length) : 0;
    var html = '' +
      '<div class="kpi"><div class="val">' + MB.formatPrix(ca) + '</div><div class="lbl">CA total</div></div>' +
      '<div class="kpi"><div class="val">' + d.total + '</div><div class="lbl">Commandes</div></div>' +
      '<div class="kpi"><div class="val">' + MB.formatPrix(d.caBrazza) + '</div><div class="lbl">CA Brazzaville</div></div>' +
      '<div class="kpi"><div class="val">' + MB.formatPrix(d.caLome) + '</div><div class="lbl">CA Lome</div></div>' +
      '<div class="kpi"><div class="val">' + tempsMoyen + ' min</div><div class="lbl">Temps moyen prep.</div></div>';
    document.getElementById('kpis').innerHTML = html;
  }

  function rendreCharts() {
    var d = donnees();
    Chart.defaults.color = '#9A9A9A';
    Chart.defaults.font.family = 'DM Sans, sans-serif';
    Chart.defaults.borderColor = 'rgba(255,255,255,.04)';

    // CA comparatif (barres avec gradients)
    var ctxCa = document.getElementById('chart-ca').getContext('2d');
    var gradOr = ctxCa.createLinearGradient(0, 0, 0, 300);
    gradOr.addColorStop(0, 'rgba(242,183,5,.9)');
    gradOr.addColorStop(1, 'rgba(242,183,5,.3)');
    var gradVert = ctxCa.createLinearGradient(0, 0, 0, 300);
    gradVert.addColorStop(0, 'rgba(3,140,62,.9)');
    gradVert.addColorStop(1, 'rgba(3,140,62,.3)');

    new Chart(ctxCa, {
      type: 'bar',
      data: { labels: ['Brazzaville', 'Lome'], datasets: [{ label: 'CA', data: [d.caBrazza, d.caLome], backgroundColor: [gradOr, gradVert], borderRadius: 8, borderSkipped: false }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.04)' } }, x: { grid: { display: false } } } }
    });

    // Ventes par categorie (donut)
    var labels = Object.keys(d.cats);
    new Chart(document.getElementById('chart-cat'), {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Aucune donnee'],
        datasets: [{
          data: labels.length ? labels.map(function (k) { return d.cats[k]; }) : [1],
          backgroundColor: ['rgba(242,183,5,.85)', 'rgba(3,140,62,.85)', 'rgba(191,4,4,.85)', 'rgba(224,123,0,.85)', 'rgba(136,136,136,.6)'],
          borderColor: '#161616',
          borderWidth: 3
        }]
      },
      options: { cutout: '55%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } } } }
    });

    // Temps moyen de prep (courbe avec gradient fill)
    var ctxTemps = document.getElementById('chart-temps').getContext('2d');
    var gradLine = ctxTemps.createLinearGradient(0, 0, 0, 250);
    gradLine.addColorStop(0, 'rgba(242,183,5,.25)');
    gradLine.addColorStop(1, 'rgba(242,183,5,.01)');

    new Chart(ctxTemps, {
      type: 'line',
      data: {
        labels: d.temps.map(function (_, i) { return '#' + (i + 1); }),
        datasets: [{
          label: 'Minutes',
          data: d.temps,
          borderColor: '#F2B705',
          backgroundColor: gradLine,
          tension: .4, fill: true,
          pointBackgroundColor: '#F2B705',
          pointBorderColor: '#161616',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: { scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.04)' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
    });
  }

  function rendreCRM() {
    var demandes = MB.getFranchiseDemandes();
    var body = document.getElementById('crm-body');
    var bodyContactes = document.getElementById('crm-contactes-body');
    var sectionContactes = document.getElementById('crm-contactes-section');

    // Separer les demandes
    var nouvelles = [];
    var contactees = [];
    demandes.forEach(function (d, idx) {
      if (d.contacte) { contactees.push({ d: d, idx: idx }); }
      else { nouvelles.push({ d: d, idx: idx }); }
    });

    // Nouvelles demandes
    if (!nouvelles.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="crm-empty"><div class="crm-empty-icone">📋</div><p>Aucune nouvelle demande</p></div></td></tr>';
    } else {
      body.innerHTML = nouvelles.map(function (item) {
        var d = item.d;
        var nom = d.prenom + ' ' + d.nom;
        var date = new Date(d.date).toLocaleDateString('fr-FR');
        var budget = BUDGET_LABELS[d.budget] || d.budget;
        var badge = d.fortPotentiel ? ' <span class="badge-or">Fort Potentiel</span>' : '';
        var msg = 'Bonjour ' + d.prenom + ', merci pour votre interet a ouvrir une franchise Mr. Burger a ' + d.ville + ' (budget ' + budget + '). Discutons de votre projet !';
        var tel = (d.whatsapp || '').replace(/[^0-9]/g, '');
        var wa = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg);
        return '<tr class="' + (d.fortPotentiel ? 'ligne-potentiel' : '') + '">' +
          '<td>' + nom + badge + '</td>' +
          '<td>' + d.ville + '</td>' +
          '<td>' + budget + '</td>' +
          '<td>' + (d.experience === 'oui' ? 'Oui' : 'Non') + '</td>' +
          '<td>' + date + '</td>' +
          '<td><div class="crm-actions-cell">' +
            '<a class="btn-whatsapp" href="' + wa + '" target="_blank" rel="noopener">💬 WhatsApp</a>' +
            '<button class="btn-contacte" data-idx="' + item.idx + '">✓ Contacté</button>' +
          '</div></td>' +
          '</tr>';
      }).join('');

      // Branche les boutons "Contacte"
      body.querySelectorAll('.btn-contacte').forEach(function (btn) {
        btn.addEventListener('click', function () {
          MB.jouerSon('click');
          var idx = Number(btn.getAttribute('data-idx'));
          var liste = MB.getFranchiseDemandes();
          liste[idx].contacte = true;
          localStorage.setItem('franchise_demandes', JSON.stringify(liste));
          MB.toast(liste[idx].prenom + ' marque comme contacte');
          rendreCRM();
        });
      });
    }

    // Section deja contactes
    if (contactees.length && sectionContactes && bodyContactes) {
      sectionContactes.style.display = '';
      bodyContactes.innerHTML = contactees.map(function (item) {
        var d = item.d;
        var nom = d.prenom + ' ' + d.nom;
        var date = new Date(d.date).toLocaleDateString('fr-FR');
        var budget = BUDGET_LABELS[d.budget] || d.budget;
        var badge = d.fortPotentiel ? ' <span class="badge-or">Fort Potentiel</span>' : '';
        var tel = (d.whatsapp || '').replace(/[^0-9]/g, '');
        var wa = 'https://wa.me/' + tel;
        return '<tr class="' + (d.fortPotentiel ? 'ligne-potentiel' : '') + '">' +
          '<td>' + nom + badge + '</td>' +
          '<td>' + d.ville + '</td>' +
          '<td>' + budget + '</td>' +
          '<td>' + date + '</td>' +
          '<td><a class="btn-wa-direct" href="' + wa + '" target="_blank" rel="noopener">💬 Recontacter</a></td>' +
          '</tr>';
      }).join('');
    } else if (sectionContactes) {
      sectionContactes.style.display = 'none';
    }
  }

  /* --- FACTURE (impression staff) --- */
  function imprimerFacture(id) {
    var commande = MB.getCommandes().filter(function (c) { return c.id === id; })[0];
    if (!commande) { MB.toast('Commande introuvable'); return; }

    var articles = commande.articles.map(function (a) {
      return '<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">' + a.qte + '× ' + a.nom + '</td>' +
        '<td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">' + MB.formatPrix(a.prix * a.qte) + '</td></tr>';
    }).join('');
    var date = new Date(commande.heure).toLocaleString('fr-FR');
    var modeLabel = commande.mode === 'livraison' ? 'Livraison' : 'Sur place';
    var paiementLabel = commande.paiement === 'comptoir' ? 'A encaisser au comptoir' : (commande.operateur || 'Mobile Money');
    var clientInfo = commande.client.prenom + ' — ' + commande.client.tel;
    if (commande.mode === 'livraison' && commande.client.adresse) {
      clientInfo += '<br/>' + commande.client.adresse;
    }
    if (commande.client.table) {
      clientInfo += ' — Table ' + commande.client.table;
    }

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"/>' +
      '<title>Facture ' + commande.id + '</title>' +
      '<style>body{font-family:"DM Sans",Arial,sans-serif;max-width:380px;margin:1rem auto;padding:1.5rem;color:#1a1a1a;font-size:14px;}' +
      'h1{font-size:1.4rem;text-align:center;margin-bottom:0;}' +
      '.sub{text-align:center;color:#666;font-size:.82rem;margin-bottom:1.5rem;}' +
      '.sep{border:none;border-top:1px dashed #ccc;margin:1rem 0;}' +
      'table{width:100%;border-collapse:collapse;}' +
      '.total-row{font-size:1.1rem;font-weight:700;padding-top:.8rem;border-top:2px solid #1a1a1a;}' +
      '.info{font-size:.82rem;color:#555;margin-top:1rem;}' +
      '.info p{margin:.3rem 0;}' +
      '.badge{display:inline-block;background:#ff6600;color:#fff;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:700;}' +
      '.footer{text-align:center;margin-top:1.5rem;font-size:.78rem;color:#999;}' +
      '@media print{body{margin:0;padding:.5rem;}}</style></head><body>' +
      '<h1>Mr. Burger</h1>' +
      '<p class="sub">FACTURE</p>' +
      '<hr class="sep"/>' +
      '<p><strong>' + commande.id + '</strong> — ' + date + '</p>' +
      '<p><strong>Client :</strong> ' + clientInfo + '</p>' +
      '<p><strong>Service :</strong> ' + modeLabel + '</p>' +
      '<p><strong>Paiement :</strong> ' + paiementLabel +
        (commande.paiement === 'comptoir' ? ' <span class="badge">A ENCAISSER</span>' : ' ✓ Paye') + '</p>' +
      '<hr class="sep"/>' +
      '<table>' + articles + '</table>' +
      '<p class="total-row">TOTAL : ' + MB.formatPrix(commande.total) + '</p>' +
      '<hr class="sep"/>' +
      '<p class="footer">Mr. Burger — Toujours le meilleur<br/>Merci et a bientot !</p>' +
      '</body></html>';

    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.setTimeout(function () { w.print(); }, 300);
  }

  /* --- Exposition --- */
  window.Staff = {
    initLogin: initLogin,
    initKDS: initKDS,
    initDispatch: initDispatch,
    initMaster: initMaster
  };
})();
