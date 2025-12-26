# Deployment Guide

## Quick Deploy to Popular Platforms

### Option 1: Netlify (Recommended - Easiest)

#### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Using Netlify UI

1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

**Result**: Your game will be live at `https://your-site-name.netlify.app`

---

### Option 2: Vercel

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (will prompt for configuration)
vercel
```

#### Using Vercel UI

1. Go to https://vercel.com
2. Click "Import Project"
3. Import from your GitHub repository
4. Vercel auto-detects Vite configuration
5. Click "Deploy"

**Result**: Your game will be live at `https://your-project.vercel.app`

---

### Option 3: GitHub Pages

1. Install gh-pages package:

```bash
npm install --save-dev gh-pages
```

2. Add to `package.json` scripts:

```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Update `vite.config.ts` (create if doesn't exist):

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pin-puzzle-game/', // Replace with your repo name
});
```

4. Deploy:

```bash
npm run deploy
```

5. Enable GitHub Pages in your repo settings:
   - Go to Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Folder: `/root`

**Result**: Your game will be live at `https://yourusername.github.io/pin-puzzle-game/`

---

## Platform Comparison

| Platform         | Pros                                                                         | Cons                                          | Best For                        |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| **Netlify**      | - Instant deploys<br>- Custom domains<br>- Preview deployments<br>- Free SSL | - None for this use case                      | **Recommended** - Easiest setup |
| **Vercel**       | - Fast global CDN<br>- Automatic previews<br>- Analytics available           | - None for this use case                      | Production deployments          |
| **GitHub Pages** | - Free<br>- Integrated with repo<br>- No additional account                  | - Manual base path config<br>- Slower updates | Quick testing/demos             |

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Game loads and displays correctly
- [ ] Canvas renders water particles
- [ ] Pins are clickable
- [ ] Physics simulation works
- [ ] Win/loss conditions trigger
- [ ] Reset button works
- [ ] Next level button appears on win
- [ ] Export playtest data downloads JSON
- [ ] Game works on mobile devices
- [ ] Performance is smooth (60 FPS)

---

## Sharing with Playtesters

Once deployed, share:

1. **Game URL**: `https://your-deployment-url.com`
2. **Instructions**: "Click pins to pull them and guide water to the treasure"
3. **Request**: "Please click 'Export Playtest Data' when finished"
4. **Playtest Protocol**: Share relevant sections from `docs/Playtest-Protocol.md`

### Example Tester Email

```
Subject: Playtest Invitation - Pin Puzzle Game

Hi [Tester Name],

I'm inviting you to playtest a new puzzle game! Your feedback will help shape the final product.

🎮 Game Link: [YOUR_DEPLOYMENT_URL]

📋 What to do:
1. Play through the levels (no time pressure!)
2. Click "Export Playtest Data" when you finish or stop
3. Email me the downloaded JSON file
4. (Optional) Share any feedback or thoughts

⏱️ Time needed: 30-45 minutes

The game is a physics-based puzzle where you pull pins to guide water to treasure while avoiding lava.

Thanks for helping!
[Your Name]
```

---

## Custom Domain Setup (Optional)

### Netlify

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### Vercel

1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS as instructed

---

## Environment Variables

This project doesn't require any environment variables for basic deployment. If you add analytics or backend features in Phase 2, document them here.

---

## Troubleshooting

### Build fails on platform

- Verify Node.js version (16+)
- Check that all dependencies are in `package.json`, not `package-lock.json` only
- Ensure `npm run build` works locally first

### Game doesn't load

- Check browser console for errors
- Verify base path is correct (for GitHub Pages)
- Ensure Canvas2D is supported (all modern browsers)

### Touch doesn't work on mobile

- Touch events are implemented - verify HTTPS is being used
- Some platforms require HTTPS for touch events

### Performance issues

- Check browser DevTools performance tab
- Reduce particle count in levels if needed (edit `src/data/levels.json`)
- Verify 60 FPS target in DevTools

---

## Monitoring (Optional)

Consider adding:

- **Analytics**: Google Analytics, Plausible, or Fathom
- **Error tracking**: Sentry or LogRocket
- **Performance**: Web Vitals monitoring

These should be added in Phase 2 after core gameplay is validated.

---

## Updating the Deployment

### Netlify/Vercel (with Git integration)

Simply push to your main branch:

```bash
git push origin main
```

Platform will auto-deploy.

### Manual Deploys

```bash
npm run build
netlify deploy --prod --dir=dist
# or
vercel --prod
```

---

## Cost Considerations

All recommended platforms offer **free tiers** suitable for Phase 1 playtesting:

- **Netlify Free**: 100 GB bandwidth, unlimited sites
- **Vercel Free**: 100 GB bandwidth, unlimited projects
- **GitHub Pages**: Unlimited for public repos

Expected bandwidth for playtests: ~20 MB per 20-level session = ~2 GB for 100 testers.

---

**Recommendation**: Deploy to Netlify first for fastest setup, then consider other platforms if specific features are needed.
