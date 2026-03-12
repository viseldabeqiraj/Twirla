# Deploy Twirla (frontend) to Cloudflare Pages

Deploy the Twirla frontend on **Cloudflare Pages** so it’s fast and reliable for your clients (global CDN, free tier).

> **Important:** Use **Pages**, not **Workers**.  
> - **Pages** = static site hosting (build from Git → `*.pages.dev`). Use this for Twirla.  
> - **Workers** = run JavaScript on the edge (`*.workers.dev`). A static Vite app deployed as a Worker will show a **blank page**.  
> If you already created a Worker, create a **new Pages project** and connect the same repo (steps below).

## Build settings (use these in the dashboard)

**Option A – Recommended (root directory set):**

| Setting            | Value             |
|--------------------|-------------------|
| **Framework preset** | React (Vite)   |
| **Build command**   | `npm run build` |
| **Build output directory** | `dist`   |
| **Root directory**  | `frontend`       |
| **Production branch** | `master` (or `main`) |

**Option B – If root directory can’t be set** (e.g. UI doesn’t apply it):

Leave **Root directory** blank. The repo has a root `package.json` that runs the frontend build. Use:

| Setting            | Value             |
|--------------------|-------------------|
| **Build command**   | `npm run build` |
| **Build output directory** | `frontend/dist` |
| **Root directory**  | *(leave empty)*   |
| **Production branch** | `master` (or `main`) |

SPA routing works automatically: Pages serves `index.html` for all paths so React Router works.

---

## Deploy steps (GitHub → Cloudflare)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Cloudflare Pages deploy config"
   git push origin master
   ```

2. **Open Cloudflare Dashboard**  
   Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**.

3. **Create a Pages project (not a Worker)**
   - Click **Create** → **Pages** (under "Create application"), then **Connect to Git**.
   - Do **not** choose "Create Worker" or "Workers" — that gives a `*.workers.dev` URL and will show a blank page for this app.
   - Choose **GitHub** and authorize Cloudflare if needed.
   - Select the **Twirla** repo: `viseldabeqiraj/Twirla`.

4. **Configure the build**
   - **Project name:** e.g. `twirla` (your live URL will use this).
   - **Production branch:** `master` (or `main` if you use that).
   - **Framework preset:** **React (Vite)** (or **None** and set the rest manually).
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** click **Set root directory** and choose **`frontend`** (important for this repo).

5. **Save and Deploy**  
   Click **Save and Deploy**. The first build may take 1–2 minutes.

---

## URLs you get

After the first successful deploy:

- **Production:**  
  `https://twirla.pages.dev`  
  (or `https://<project-name>.pages.dev` if you used a different project name)

- **Preview (per branch/PR):**  
  Each push to another branch gets a preview, e.g.  
  `https://<branch>.<project-name>.pages.dev`

- **Custom domain (optional):**  
  In the project → **Custom domains** you can add e.g. `app.yourdomain.com` for clients.

You’ll see the exact URLs in **Workers & Pages** → your Twirla project → **Deployments**.

---

## Backend / API

The frontend is static. It expects:

- **`/api`** – backend API (shop config, analytics).
- **`/logos`** – logo images.

For production you can:

- Deploy the .NET backend elsewhere (e.g. Azure, Railway) and point the frontend at that API, or  
- Run a **teaser-only** site (landing/scratch card) with no API; the current build is enough for that.

---

## Optional: deploy from CLI

If you use Wrangler for uploads (e.g. CI):

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=twirla
```

You’ll need a Cloudflare account and `wrangler login` once.

---

## Troubleshooting build errors

If the build fails on Cloudflare, check the following in your **Pages** project (Settings → Builds & deployments → Build configuration).

### 1. `ENOENT: no such file or directory, open '.../repo/package.json'`

**Symptom:** Build runs from repo root and can’t find `package.json` (the app lives in `frontend/`).

**Fix (choose one):**

- **Preferred:** In the Pages project → **Settings** → **Builds & deployments** → **Build configuration**, set **Root directory** to **`frontend`** (no leading slash). Set **Build output directory** to **`dist`**. Save and redeploy.
- **Alternative:** Leave Root directory **empty**. Set **Build command** to **`npm run build`** and **Build output directory** to **`frontend/dist`**. The repo root has a `package.json` that runs the frontend build, so the build will succeed from the repo root. Save and redeploy.

### 2. Use a supported Node version

**Symptom:** Errors about `engine`, `node version`, or modules not found.

**Fix:** In the Pages project go to **Settings** → **Environment variables**. Add:

- **Variable name:** `NODE_VERSION`  
- **Value:** `20`  
- **Environment:** Production (and Preview if you use it)

Save and **retry the deployment** (Redeploy from the Deployments tab).

### 3. Build settings checklist

| Field | Must be |
|--------|--------|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` |
| **Framework preset** | React (Vite) or None |

If you use **None**, you must fill in Build command and Build output directory yourself.

### 4. Make sure it’s a Pages project

If the project URL is `*.workers.dev`, it’s a **Worker**, not **Pages**. Workers will not serve this static app correctly. Create a new project, choose **Pages** → **Connect to Git**, and use the settings above. Your live URL should be `*.pages.dev`.

### 5. Still failing?

Open the failed deployment in the dashboard and copy the **build log** (the red error lines). The message usually says whether the failure is:

- missing `package.json` → wrong root directory  
- Node/engine error → set `NODE_VERSION` to `20`  
- `tsc` or TypeScript error → fix the reported file/line locally, then push again
