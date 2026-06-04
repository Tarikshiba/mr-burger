# Mr. Burger — Prototype front-end

Prototype fonctionnel pour la marque **Mr. Burger** (Brazzaville, Congo · XAF / Lome, Togo · XOF).
JavaScript ES6+ natif, sans framework. `localStorage` sert de base de donnees simulee
pour synchroniser toutes les vues en pseudo temps reel (polling 2s).

## Structure

```
├─ index.html              # Selection ville -> client/
├─ client/
│  ├─ index.html           # Hero video + menu dynamique
│  ├─ checkout.html        # Tunnel 3 etapes + paiement MoMo simule
│  ├─ tracking.html        # Suivi commande en direct
│  └─ franchise.html       # Tunnel demande de partenariat
├─ staff/
│  ├─ login.html           # Authentification simulee
│  ├─ kds.html             # Kitchen Display System + ruptures
│  ├─ dispatch.html        # Attribution aux livreurs
│  └─ master.html          # Analytics (Chart.js) + CRM franchise
├─ css/style.css           # Design system global
├─ js/
│  ├─ core.js              # State localStorage + utilitaires (window.MrBurger)
│  ├─ client.js            # Panier, commandes, animations (window.Client)
│  └─ staff.js             # KDS, dispatch, master (window.Staff)
└─ assets/
   ├─ audio/               # click / cart-add / success / kitchen-alert / notification (.mp3)
   └─ video/               # hero-bg.mp4
```

## Assets a fournir

Les fichiers binaires ne sont pas inclus. A deposer :

- `assets/video/hero-bg.mp4` (25s, boucle)
- `assets/audio/click.mp3`, `cart-add.mp3`, `success.mp3`, `kitchen-alert.mp3`, `notification.mp3`

## Comptes de demonstration (staff/login.html)

| Role  | Identifiant | Mot de passe |
|-------|-------------|--------------|
| Staff | `staff`     | `kitchen2024`|
| Master| `master`    | `mrboss2024` |

## Lancer

Servir le dossier en statique (chemins relatifs uniquement). Exemple :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Demo pseudo temps reel

Ouvrir `client/` et `staff/kds.html` dans deux onglets : marquer une commande en cuisine / prete
cote KDS met a jour le suivi client automatiquement, et basculer une rupture grise l'article cote menu.
