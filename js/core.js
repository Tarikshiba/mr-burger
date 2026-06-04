/* =========================================================
   MR. BURGER — CORE.JS
   State management localStorage + utilitaires reutilisables.
   Expose les fonctions via l'objet global window.MrBurger
   (pas de modules ES6 import/export : compatible Pages statique).
   ========================================================= */
(function () {
  'use strict';

  /* --- Cache des objets Audio pour eviter de les recreer --- */
  var cacheSons = {};

  /* --- Catalogue centralise des sons --- */
  var SONS = {
    click: 'click.mp3',
    'cart-add': 'cart-add.mp3',
    success: 'success.mp3',
    'kitchen-alert': 'kitchen-alert.mp3',
    notification: 'notification.mp3'
  };

  /* Detecte la profondeur pour construire le chemin relatif vers /assets */
  function basePath() {
    // Les pages staff/ et client/ sont a un niveau de profondeur
    return (location.pathname.indexOf('/client/') > -1 || location.pathname.indexOf('/staff/') > -1) ? '../' : '';
  }

  /* Joue un son d'interface. // 🔊 SON : <nom>.mp3 */
  function jouerSon(nom) {
    var fichier = SONS[nom];
    if (!fichier) { return; }
    try {
      if (!cacheSons[nom]) {
        cacheSons[nom] = new Audio(basePath() + 'assets/audio/' + fichier);
      }
      var a = cacheSons[nom];
      a.currentTime = 0;
      // play() peut etre rejete tant que l'utilisateur n'a pas interagi : on ignore l'erreur
      var p = a.play();
      if (p && p.catch) { p.catch(function () {}); }
    } catch (e) { /* audio indisponible : silencieux */ }
  }

  /* Transition en fondu vers une autre page (aucun flash blanc) */
  function transitionVers(url) {
    document.body.classList.remove('fade-in');
    document.body.classList.add('fade-out');
    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () { location.href = url; }, reduit ? 0 : 300);
  }

  /* --- DEVISE & PRIX --- */
  function getDevise() { return localStorage.getItem('devise') || 'XOF'; }
  function getVille() { return localStorage.getItem('ville') || 'lome'; }

  /* formatPrix : lit la devise dans le localStorage et formate le montant.
     Les valeurs numeriques sont identiques en XAF et XOF, seul le suffixe change. */
  function formatPrix(montant) {
    var n = Number(montant) || 0;
    var sep = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return sep + ' ' + getDevise();
  }

  /* --- COMMANDES --- */
  function getCommandes() {
    try { return JSON.parse(localStorage.getItem('commandes') || '[]'); }
    catch (e) { return []; }
  }

  function sauvegarderCommande(commande) {
    var liste = getCommandes();
    liste.push(commande);
    localStorage.setItem('commandes', JSON.stringify(liste));
    // Statut initial de la commande
    setStatutCommande(commande.id, 'recue');
    return commande;
  }

  function getStatutCommande(id) {
    return localStorage.getItem('statut_commande_' + id) || 'recue';
  }

  function setStatutCommande(id, statut) {
    localStorage.setItem('statut_commande_' + id, statut);
  }

  /* Genere un numero de commande lisible et aleatoire */
  function genererNumeroCommande() {
    var n = Math.floor(1000 + Math.random() * 9000);
    return 'MB-' + n;
  }

  /* --- PANIER (partage entre les pages client) --- */
  function getPanier() {
    try { return JSON.parse(localStorage.getItem('panier') || '[]'); }
    catch (e) { return []; }
  }
  function setPanier(p) { localStorage.setItem('panier', JSON.stringify(p)); }
  function viderPanier() { localStorage.removeItem('panier'); }
  function totalPanier() {
    return getPanier().reduce(function (s, a) { return s + (a.prix * a.qte); }, 0);
  }
  function nbArticlesPanier() {
    return getPanier().reduce(function (s, a) { return s + a.qte; }, 0);
  }

  /* --- RUPTURES DE STOCK --- */
  function estEnRupture(id) { return localStorage.getItem('rupture_' + id) === 'true'; }
  function basculerRupture(id) {
    var v = !estEnRupture(id);
    localStorage.setItem('rupture_' + id, v ? 'true' : 'false');
    return v;
  }

  /* --- FRANCHISE --- */
  function getFranchiseDemandes() {
    try { return JSON.parse(localStorage.getItem('franchise_demandes') || '[]'); }
    catch (e) { return []; }
  }
  function ajouterFranchiseDemande(demande) {
    var liste = getFranchiseDemandes();
    liste.push(demande);
    localStorage.setItem('franchise_demandes', JSON.stringify(liste));
  }

  /* --- POLLING centralise (synchronisation pseudo temps reel entre onglets) --- */
  /* abonnerPolling(callback) : execute callback toutes les 2000ms. Retourne l'id pour clearInterval. */
  function abonnerPolling(callback) {
    callback(); // execution immediate au demarrage
    return setInterval(callback, 2000);
  }

  /* --- Toast utilitaire --- */
  function toast(message) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  /* --- Garde-fou : redirige si aucune ville choisie (pages client) --- */
  function exigerVille() {
    if (!localStorage.getItem('ville')) {
      location.href = basePath() + 'index.html';
    }
  }

  /* --- Exposition globale --- */
  window.MrBurger = {
    jouerSon: jouerSon,
    transitionVers: transitionVers,
    getDevise: getDevise,
    getVille: getVille,
    formatPrix: formatPrix,
    getCommandes: getCommandes,
    sauvegarderCommande: sauvegarderCommande,
    getStatutCommande: getStatutCommande,
    setStatutCommande: setStatutCommande,
    genererNumeroCommande: genererNumeroCommande,
    getPanier: getPanier,
    setPanier: setPanier,
    viderPanier: viderPanier,
    totalPanier: totalPanier,
    nbArticlesPanier: nbArticlesPanier,
    estEnRupture: estEnRupture,
    basculerRupture: basculerRupture,
    getFranchiseDemandes: getFranchiseDemandes,
    ajouterFranchiseDemande: ajouterFranchiseDemande,
    abonnerPolling: abonnerPolling,
    toast: toast,
    exigerVille: exigerVille
  };
})();
