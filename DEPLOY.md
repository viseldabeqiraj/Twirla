# Deploy Twirla (frontend) to Cloudflare Pages

Deploy the Twirla frontend on **Cloudflare Pages** so it’s fast and reliable for your clients (global CDN, free tier).

> **Important:** Use **Pages**, not **Workers**.  
> - **Pages** = static site hosting (build from Git → `*.pages.dev`). Use this for Twirla.  
> - **Workers** = run JavaScript on the edge (`*.workers.dev`). A static Vite app deployed as a Worker will show a **blank page**.  
> If you already created a Worker, create a **new Pages project** and connect the same repo (steps below).

## Build settings (use these in the dashboard)

| Setting            | Value             |
|--------------------|-------------------|
| **Framework preset** | React (Vite)   |
| **Build command**   | `npm run build` |
| **Build output directory** | `dist`   |
| **Root directory**  | `frontend`       |
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
