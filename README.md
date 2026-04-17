# MLUE TECHNOLOGY Website

MLUE TECHNOLOGY’s public website is a static, SEO-friendly business site designed to showcase services, pricing, projects, and direct contact channels. It combines a polished marketing experience with bilingual support, a smart chatbot, and a mobile-friendly pricing layout.

## Live Site

- Production: https://mluetechnology.me

## What This Project Includes

- A modern homepage for business technology services
- Bilingual interface with English and Swahili support
- Animated hero and polished marketing sections
- Team showcase and company information
- A dedicated pricing page with detailed package breakdowns
- Mobile hamburger navigation for small screens
- Collapsible pricing cards for easier scanning on mobile
- Contact form handling through FormSubmit
- WhatsApp-friendly contact access
- An integrated chatbot with:
  - Intent detection
  - Topic matching
  - Prebuilt knowledge responses in English and Swahili
  - Optional Hugging Face fallback
- Supporting pages for:
  - Projects
  - Privacy Policy
  - Terms of Service

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- FormSubmit for contact handling
- Optional Hugging Face Inference API for chatbot fallback

## Project Structure

```text
.
|-- index.html
|-- pricing/
|   `-- index.html
|-- styles.css
|-- main.js
|-- i18n.js
|-- chatbot.js
|-- robots.txt
|-- sitemap.xml
|-- assets/
|   |-- favicon/
|   `-- projects/
|-- privacy/
|   `-- index.html
|-- projects/
|   `-- index.html
`-- ToS/
    `-- index.html
```

## Pricing Page Summary

The pricing page now presents the full MLUE TECHNOLOGY price kit in a structured format:

- Landing Pages
- Static Websites
- Dynamic Websites
- Domain Name
- Web Hosting and Deployment
- Maintenance and Support

Each package includes pricing, what is included, what is excluded, and example project types. On mobile, the package details collapse behind a `View more` button, and the page header uses a hamburger menu for easier navigation.

## Run Locally

Because this is a static site, you can run it with any local server.

### VS Code Live Server

1. Open the project in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html` and choose **Open with Live Server**.

### Python HTTP Server

```bash
python -m http.server 5500
```

Then open:

- http://localhost:5500

## Configuration Notes

### Contact Form

The main site and pricing page both submit through FormSubmit and currently send to `mluetechnologytz@gmail.com`.

To change the destination email, update the form action:

```html
<form action="https://formsubmit.co/YOUR_EMAIL@example.com" ...>
```

### Chatbot

The chatbot is configured in `chatbot.js`.

- `HF_API_URL` points to the Hugging Face endpoint.
- `HF_TOKEN` is currently empty.

If you enable AI fallback, keep the token out of frontend code in production and proxy requests through your backend.

### Language Switching

Language data lives in `i18n.js`.

- Language preference is stored in `localStorage` under `mlue-lang`
- Add a new language by extending the `translations` object and updating the UI controls

## SEO and Indexing

- `robots.txt` allows crawling and references the sitemap
- `sitemap.xml` currently includes the homepage

If you add or expand pages, update the sitemap so search engines can discover them properly.

## Deployment

This site can be deployed to any static hosting provider:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Traditional shared hosting

Before deploying, verify:

1. Internal links and paths
2. Contact form destination email
3. Favicon and Open Graph assets
4. Production domain in metadata
5. Mobile and desktop responsiveness

## Maintenance

- Keep privacy and terms content current
- Review chatbot knowledge and responses periodically
- Keep pricing packages aligned with current offerings
- Update project showcase items as work changes
- Refresh the sitemap when new pages are added

## Contact

- Email: mluetechnologytz@gmail.com
- Website: https://mluetechnology.me
- WhatsApp: +255 752 804 154

## License

All rights reserved by MLUE TECHNOLOGY unless stated otherwise.
