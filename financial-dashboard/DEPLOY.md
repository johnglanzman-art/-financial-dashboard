# Financial Dashboard - Deployment Guide

## Quick Deploy to Vercel (Recommended - Free)

### Option A: Deploy via GitHub (Best for ongoing updates)

1. **Create a GitHub repository**
   - Go to github.com and create a new repository called `financial-dashboard`

2. **Upload the code**
   - Unzip `financial-dashboard.zip`
   - Upload all files to your GitHub repo

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up (free)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects it's a React app
   - Click "Deploy"
   - Done! You'll get a URL like `financial-dashboard-xyz.vercel.app`

### Option B: Deploy via Vercel CLI (Quick one-time deploy)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Unzip and navigate to the project:
   ```bash
   unzip financial-dashboard.zip
   cd financial-dashboard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts - you'll get a live URL!

---

## Alternative: Deploy to Netlify (Also Free)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop the `financial-dashboard` folder onto Netlify
3. Done! You get a URL like `financial-dashboard.netlify.app`

---

## Local Development

To run locally for testing:

```bash
cd financial-dashboard
npm install
npm start
```

Opens at `http://localhost:3000`

---

## How to Use

1. Visit your deployed URL
2. Enter current BTC price and AUD/USD rate
3. Upload your `Finances_XXXX_EOFY.xlsx` spreadsheet
4. Dashboard loads with all your data!

---

## Sharing with Family

Once deployed, just share the URL. Anyone can:
1. Visit the link
2. Enter current market prices
3. Upload the latest spreadsheet
4. View the full dashboard

**Note:** The spreadsheet is processed entirely in the browser - no data is sent to any server. Your financial data stays private.

---

## Updating the Dashboard

If you want to make changes to the dashboard:

1. Edit files in `src/Dashboard.js`
2. Push to GitHub (if using Option A)
3. Vercel auto-redeploys

Or just re-deploy via CLI.

---

## Troubleshooting

**"Module not found" error:**
```bash
npm install
```

**Blank screen after upload:**
- Check browser console for errors (F12)
- Make sure spreadsheet has "2023 ->" sheet

**Charts not showing:**
- Recharts library should install automatically
- If not: `npm install recharts`
