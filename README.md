# G&E Cleaning Solutions — Website

Fast, mobile-friendly website for G&E Cleaning Solutions. It lives on GitHub, publishes free on GitHub Pages, and is edited without code in **Pages CMS**.

## Pages
| Page | Address | Edit in Pages CMS |
|---|---|---|
| Home | `/` | Home page |
| Residential Cleaning | `/residential-cleaning/` | Services |
| Deep Cleaning | `/deep-cleaning/` | Services |
| Move-In/Move-Out Cleaning | `/move-in-move-out-cleaning/` | Services |
| Post-Construction Cleaning | `/post-construction-cleaning/` | Services |
| Commercial Cleaning | `/commercial-cleaning/` | Services |
| About Us & Our Work (gallery + reviews) | `/about/` | Before & after gallery, Customer reviews |
| Contact / Request a Quote | `/contact/` | Business settings |
| Service Areas (+ future town pages) | `/service-areas/` | Service areas, Town pages |

---

## For Gisel: editing the site without code
1. Go to **app.pagescms.org** and sign in with GitHub (or accept the email invite).
2. Open **demo-website**.
3. Choose what to edit in the left menu, make your change, and click **Save**.
4. The site updates by itself in about a minute.

| To… | Open… |
|---|---|
| Change phone, email, service area, Google links | **Business settings** |
| Change the home page headline or photo | **Home page** |
| Edit a service's text, checklist, FAQs or photo | **Services** |
| Add a before-and-after project | **Before & after gallery** → Add item → upload both photos |
| Add a customer review | **Customer reviews** → Add item (real reviews only) |
| Add or remove towns | **Service areas** |
| Create a town page for SEO | **Town pages** → Add entry → write local text → turn off **Draft** |

The gallery and reviews sections stay hidden until the first item is added.

---

## Quote form
- Questions change with the service the customer picks, for example bedrooms and bathrooms for homes, or project phase for construction.
- Each submission is emailed to the business email and saved in the Formspree dashboard, where it can also be exported or sent to a Google Sheet.
- **Setup:** create a form at formspree.io using info@gecleaningsolutions.com, then paste its endpoint into **Business settings → Quote form endpoint**.
- **Photo uploads and a permanent archive need Formspree's Personal plan** (about $10/month billed yearly). The free plan has no file uploads and keeps submissions for 30 days. If you stay on free, turn off **Allow photo uploads** in Business settings.
- Until an endpoint is set, the form runs in demo mode: it shows the confirmation and offers an email draft.

---

## Launch checklist

### 1. Turn on publishing (once)
Settings → Pages → Build and deployment → Source: **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes on every change. Before the domain moves, the site is at `https://gisel1987.github.io/demo-website/`.

### 2. Move gecleaningsolutions.com, keeping email untouched
Email runs on **MX** records (plus TXT records such as SPF and DKIM). The website uses different records, so email keeps working as long as only the records below change.
1. On github.com, in the repo, choose **Add file → Create new file**, name it `src/CNAME`, and enter one line: `gecleaningsolutions.com`. The workflow switches the site to the root address automatically.
2. Settings → Pages → Custom domain → `gecleaningsolutions.com` → Save.
3. At the domain registrar, change only:
   - the **A** records for `@` (the root) → GitHub Pages' four IP addresses (listed in GitHub's "Managing a custom domain" docs)
   - the **CNAME** for `www` → `gisel1987.github.io`
   - Remove any old A, AAAA or CNAME records for `@` and `www` that point to Canva. **Do not touch MX or TXT records.**
4. When GitHub shows the certificate is ready, tick **Enforce HTTPS**.
5. Send yourself a test email to confirm email still works.

### 3. Go live
- **Business settings:** turn off **Show the "Concept demo" bar**. This also lets Google index the site.
- Replace stock photos with real job photos where possible.

### 4. Google Analytics (GA4)
Create a GA4 property for gecleaningsolutions.com, copy the Measurement ID (`G-…`), and paste it into **Business settings → Google Analytics ID**. Quote requests are tracked as a `generate_lead` event.

### 5. Google Search Console
Add a **Domain** property for gecleaningsolutions.com and verify with the TXT record Google gives you. Adding a TXT record doesn't affect email. Then submit `https://gecleaningsolutions.com/sitemap.xml`.

### 6. Google Business Profile
- Set the website to `https://gecleaningsolutions.com`.
- As a service-area business, keep **"Show business address to customers"** off and list your service areas. The website never shows a street address. It shows the base city only, which you can hide in Business settings.
- Paste the profile link into **Business settings → Google Business Profile link**. This adds a "See reviews on Google" button and connects the profile to the site in Google's business data.

---

## SEO already built in
- A separate page per service, each with its own title, description, keywords and headings that target Bergen, Passaic, Essex and Morris counties and Central NJ.
- Business data for Google (schema.org `HouseCleaningService` with every county served, no street address), plus `Service` and breadcrumb data on service pages.
- Automatic `sitemap.xml` and `robots.txt`, canonical URLs, share previews.
- Fast loading: no frameworks, responsive images, lazy-loaded photos.
- Town pages are ready to add, and each one is added to the sitemap automatically.

## Ready for later
| Feature | How it fits |
|---|---|
| Online booking | Add a booking link (Jobber, Housecall Pro, Calendly) as a button, or a Book page |
| Price estimator | A new page with a simple calculator using the same fields as the quote form |
| Automated quote follow-ups | Formspree → Zapier/Make → email sequence or CRM |
| Blog | A new content collection, the same pattern as town pages |
| More service-area pages | Already built: **Town pages** in Pages CMS |

---

## For developers
- Built with Eleventy 3.1.7 (Node 22). Content is in `src/_data/*.yml` and `src/services/*.md`, templates are in `src/_includes/`, styles are in `src/assets/styles.css`.
- `npm install`, then `npm start` for a local preview at http://localhost:8080.
- Pages CMS configuration: `.pages.yml`.

## Photo credits
Stock photos from Unsplash (Unsplash License): Andrea De Santis, Jason Briscoe, roam in color, Adolfo Félix, Alex Tyson.
