# MrWhiteHat — Interactive 3D Portfolio

🌐 **Live 24/7 Deployment:** [https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/](https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/)

A 3D cybersecurity operations studio with first-person free-roam locomotion, character customization, interactive terminal stations, and cyber mini-games.

### Locomotion Controls:
* **W**: Walk Forward (aligned with camera view)
* **A**: Strafe Left
* **S**: Walk Backward
* **D**: Strafe Right
* **Shift**: Sprint
* **Mouse**: Look Around (click to lock cursor)
* **Left Click / E**: Hack / Inspect targeted terminal
* **Esc**: Unlock Cursor / Menu
* **Virtual Keypad**: On-screen tactical WASD pad & touch joystick for mobile/touch devices

## Deploy to GitHub Pages (1 Command)
```bash
npm run deploy
```

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

## Build and preview

```bash
npm run build
npm run preview
```

The production website is generated in `dist/`.

## Personalize before publishing

Edit `src/data.js`:
- Set the real email address, GitHub URL, LinkedIn URL, and resume path.
- Replace example project links with each exact repository/demo URL.
- Confirm all project descriptions, skill levels, award names, and dates.
- Add your PDF as `public/resume.pdf` if you want the resume download to work.

The content is deliberately kept in one data file so it is easy to maintain. Do not publish private contact details you do not want to share publicly.

## How object clicks map to sections

`src/data.js` exports `objectMap`. `src/components/OfficeScene.jsx` walks up the clicked mesh's parent chain and matches its GLB node names against semantic regular expressions. The supplied model contains many generated mesh names, so the matcher uses parent names such as `Monitor`, `Book`, `Cabinet`, `Office_Chair`, `printer`, and `Projector` where present. If an object opens the wrong section, adjust the rules in `objectMap` or add a more specific rule near the top. Unknown meshes open the Discover panel.

The camera smoothly moves toward the clicked surface. Visitors can continue rotating and zooming with OrbitControls. The navigation menu and section cards provide a non-3D alternative.

## Mobile and performance

The layout switches to a stacked view on smaller screens, retains touch orbit controls, and reduces device pixel ratio. The 19 MB GLB is included as supplied. Consider compressing it with glTF Transform (Meshopt or Draco where appropriate) after validating visual quality. Keep the original asset as a backup.

If your model doesn't load, confirm this file exists at `public/models/isometric_office.glb` and inspect the browser console/network panel.

## Deploy to Vercel

1. Create a GitHub repository and push this project.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. Vercel will provide a public URL; add a custom domain in project settings if desired.

No backend is required for the current static portfolio. A backend is only needed if you later want to store contact-form submissions, user accounts, or other server-side data.

## Asset attribution

The provided GLB contains metadata indicating CC BY 4.0 and Companion_Cube as author. Preserve appropriate attribution and include a source link for the original asset before publishing. Confirm the original asset page and attribution details from the download source.
