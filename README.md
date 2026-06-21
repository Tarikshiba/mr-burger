# Mr. Burger — Prototype front-end

Prototype fonctionnel pour la marque **Mr. Burger** (Brazzaville, Congo · XAF / Lomé, Togo · XOF).
Interface style **Borne Tactile / Kiosk** côté client et **Dashboard SaaS Premium** côté staff.
JavaScript ES6+ natif, sans framework. `localStorage` sert de base de données simulée
pour synchroniser toutes les vues en pseudo temps réel (polling 2s).

## Stack

- HTML / CSS / JS natif (Vanilla)
- Chart.js (CDN) — graphiques analytics
- QRCode.js (CDN) — QR code paiement
- Google Fonts : Playfair Display + DM Sans
- Design System : Premium Dark (glassmorphism, micro-interactions tactiles)

## Structure

```
├─ index.html              # Sélection ville (cartes immersives + drapeaux)
├─ client/
│  ├─ index.html           # Hero vidéo + onglets catégories + menu kiosk + footer panier + modale combo
│  ├─ checkout.html        # Tunnel : panier éditable, coordonnées, paiement (MoMo ou comptoir)
│  ├─ tracking.html        # Suivi live + QR code + reçu téléchargeable + "Bon appétit"
│  └─ franchise.html       # Tunnel partenariat + badge Fort Potentiel + confetti
├─ staff/
│  ├─ login.html           # Authentification simulée (Premium Dark)
│  ├─ kds.html             # KDS Kanban : barres progression, timers, ruptures, facture
│  ├─ dispatch.html        # Attribution livreurs + compteur live
│  └─ master.html          # Analytics (Chart.js gradients) + CRM franchise (contactés/non-contactés)
├─ css/style.css           # Design System Premium Dark complet
├─ js/
│  ├─ core.js              # State localStorage + utilitaires (window.MrBurger)
│  ├─ client.js            # Menu kiosk, modale combo, checkout, QR, reçu, tracking (window.Client)
│  └─ staff.js             # KDS, dispatch, master, facture, CRM (window.Staff)
└─ assets/
   ├─ audio/               # click / cart-add / success / kitchen-alert / notification (.mp3)
   ├─ images/              # flag-tg.png, flag-cg.png, menu/ (futur)
   └─ video/               # hero-bg.mp4
```

## Comptes de démonstration (staff/login.html)

| Rôle   | Identifiant | Mot de passe  |
|--------|-------------|---------------|
| Staff  | `staff`     | `kitchen2024` |
| Master | `master`    | `mrboss2024`  |

## Lancer

Servir le dossier en statique (chemins relatifs uniquement). Exemple :

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .

# VS Code : extension Live Server
# puis ouvrir http://localhost:8000
```

## Fonctionnalités principales

### Côté Client
- **Menu Borne Tactile** : onglets par catégorie, grille de produits, footer panier fixe
- **Modale Combo** : choix burger seul ou formule (+2 000) avec accompagnement et boisson
- **Panier éditable** : ajuster quantités (+/−), supprimer des articles
- **Paiement** : Mobile Money (MTN/Airtel ou Togocom/Moov) ou au comptoir
- **Confirmation** : modale avant validation du paiement
- **QR Code** : généré dynamiquement pour le paiement MoMo (maquette)
- **Reçu téléchargeable** : fichier HTML téléchargé côté client
- **Suivi en direct** : timeline animée synchronisée avec le KDS
- **"Bon appétit"** : écran animé quand la commande est livrée
- **Franchise** : tunnel 4 étapes avec badge "Fort Potentiel" si budget > 25M

### Côté Staff
- **KDS Kanban** : fiches avec barre de progression colorée (vert/orange/rouge)
- **Impression facture** : page formatée via window.print()
- **Dispatch** : attribution de livreur, affichage adresse ou numéro de table
- **Master Hub** : KPIs, charts avec gradients, CRM avec gestion "Déjà contactés"
- **WhatsApp** : message pré-rempli (nouveaux) ou direct (déjà contactés)
- **Ruptures** : toggle par article, reflété en temps réel côté client

## Démo pseudo temps réel

Ouvrir `client/` et `staff/kds.html` dans deux onglets :
- Passer une commande côté client → apparaît sur le KDS avec son d'alerte
- Marquer "En cuisine" / "Prête" → met à jour le tracking client automatiquement
- Basculer une rupture → grise l'article côté menu instantanément
- Attribuer un livreur → la commande passe en "livraison" → "Bon appétit" côté client

## Déploiement

Aucune configuration serveur requise. Compatible GitHub Pages :

```bash
git push origin main
# → https://tarikshiba.github.io/mr-burger/
```
