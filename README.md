# FC Den Bosch x Cookaholics - Zakelijke Events Website

Landingspagina voor zakelijke events bij FC Den Bosch, verzorgd door Cookaholics.

## 🚀 Deployen naar Vercel

### Optie 1: Via Vercel CLI (aanbevolen)

```bash
# Installeer Vercel CLI (als je dat nog niet hebt)
npm i -g vercel

# In de project folder, run:
vercel

# Volg de prompts:
# - Link to existing project? No
# - What's your project's name? fc-den-bosch-cookaholics
# - In which directory is your code located? ./
# - Want to override settings? No
```

### Optie 2: Via Vercel Dashboard

1. Ga naar [vercel.com](https://vercel.com)
2. Klik op "Add New Project"
3. Selecteer "Import Git Repository" of upload deze folder
4. Vercel detecteert automatisch dat het een static site is
5. Klik "Deploy"

### Optie 3: Via Cursor + Git

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit - FC Den Bosch landing page"

# Push naar GitHub
gh repo create fc-den-bosch-cookaholics --public --source=. --push

# Vercel koppelt automatisch als je het repo importeert
```

## 📁 Projectstructuur

```
fc-den-bosch-website/
├── index.html          # Hoofdpagina
├── vercel.json         # Vercel configuratie
├── README.md           # Dit bestand
└── images/
    ├── CookaholicsFCDenBosch-115lr.jpg   # Borrel/hapjes
    ├── CookaholicsFCDenBosch-204lr.jpg   # Business lounge
    ├── CookaholicsFCDenBosch-244lr.jpg   # Stadion uitzicht
    ├── CookaholicsFCDenBosch-245-lr.jpg  # Skybox met bar
    ├── CookaholicsFCDenBosch-291lr.jpg   # Gasten aan tafel
    ├── CookaholicsFCDenBosch-408lr.jpg   # Diner close-up
    └── Cookaholics-logo_2024_op-rood.svg # Logo
```

## ✏️ Aanpassingen maken

### Teksten wijzigen
Open `index.html` in Cursor en zoek naar de tekst die je wilt aanpassen.

### Afbeeldingen vervangen
1. Voeg nieuwe afbeeldingen toe aan `/images/`
2. Update de `src` attributen in `index.html`

### Kleuren aanpassen
De kleuren staan gedefinieerd in de `:root` CSS variabelen bovenaan het bestand:

```css
:root {
    --coral: #EE6350;      /* Primaire accent kleur */
    --goud: #C9A96E;       /* Secundaire accent */
    --zwart: #1a1a1a;      /* Donkere achtergrond */
    --cream: #F5EDE4;      /* Lichte achtergrond */
}
```

## 📱 Features

- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Cookaholics huisstijl (Cormorant Garamond + Inter fonts)
- ✅ Monochrome SVG iconen
- ✅ Echte FC Den Bosch foto's
- ✅ SEO-vriendelijke structuur
- ✅ Snelle laadtijd (static HTML)

## 🔗 Links

- **Live site**: [fc-den-bosch-cookaholics.vercel.app](https://fc-den-bosch-cookaholics.vercel.app) (na deployment)
- **Cookaholics**: [cookaholics.nl](https://cookaholics.nl)
- **FC Den Bosch**: [fcdenbosch.nl](https://fcdenbosch.nl)

## 📞 Contact

Cookaholics Events  
📍 Stadion De Vliert, Victorialaan 31, 5213 JG 's-Hertogenbosch  
📞 085 273 6709  
✉️ events@cookaholics.nl
