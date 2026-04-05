# MLUE TECHNOLOGY Website

Professional company website for MLUE TECHNOLOGY, showcasing services, featured projects, and contact channels. The site is designed as a fast, static, SEO-friendly web presence with bilingual support (English and Swahili), a smart chatbot assistant, and conversion-focused sections.

## Live Website

- Production: https://mluetechnology.me

## Project Highlights

- Modern one-page marketing site for business technology services
- Bilingual UI (English/Swahili) with persistent language preference
- Interactive sections:
  - Hero with animated canvas background
  - About, services, value proposition, and contact funnel
  - Team showcase
- Contact form integration via FormSubmit
- WhatsApp-first contact option
- Built-in chatbot with:
  - Intent detection
  - Topic matching
  - Deep predefined knowledge base (EN/SW)
  - Optional Hugging Face AI fallback
- Dedicated pages for:
  - Projects
  - Privacy Policy
  - Terms of Service
- Basic SEO setup with sitemap and robots directives

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no framework)
- FormSubmit (contact form handling)
- Optional Hugging Face Inference API (chatbot AI fallback)

## Folder Structure

```text
.
|-- index.html
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

## Getting Started (Local Development)

Because this is a static website, you can run it with any local server.

### Option 1: VS Code Live Server

1. Open the project in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option 2: Python HTTP Server

```bash
python -m http.server 5500
```

Then open:

- http://localhost:5500

## Configuration

### 1) Contact Form

The contact form posts to FormSubmit:

- Defined in `index.html` form action
- Current receiver: `mluetechnologytz@gmail.com`

To change destination email, update:

```html
<form action="https://formsubmit.co/YOUR_EMAIL@example.com" ...>
```

### 2) Chatbot AI Fallback (Optional)

In `chatbot.js`:

- `HF_API_URL` points to the configured Hugging Face model endpoint.
- `HF_TOKEN` is currently empty.

Set your token before enabling AI fallback:

```js
const HF_TOKEN = "your_hugging_face_token";
```

Security recommendation:

- Do not expose API tokens in frontend production code.
- Route AI requests through your backend proxy when moving to production-grade architecture.

### 3) Localization

- Translations are maintained in `i18n.js`
- Language choice is stored in browser local storage (`mlue-lang`)

To add a new language:

1. Add a new top-level key in `translations`.
2. Add all required translation keys.
3. Add UI controls to switch language.

## SEO and Indexing

- `robots.txt` allows crawling and points to sitemap.
- `sitemap.xml` currently includes the root URL.

If you add more pages (e.g., projects, privacy, terms), update `sitemap.xml` accordingly to include those URLs for better indexing.

## Deployment

This project can be deployed to any static hosting platform:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Traditional shared hosting

Recommended checks before deployment:

1. Verify all internal links and paths.
2. Verify contact form destination email.
3. Confirm favicon and Open Graph assets.
4. Confirm production domain in metadata.
5. Validate responsive layout on mobile and desktop.

## Maintenance Checklist

- Keep Terms and Privacy content up to date
- Review chatbot knowledge entries periodically
- Rotate and secure API keys (if used)
- Keep team and project showcase current
- Update sitemap when new pages are added

## Contact

- Email: mluetechnologytz@gmail.com
- Website: https://mluetechnology.me
- WhatsApp: +255 752 804 154

## License

All rights reserved by MLUE TECHNOLOGY unless stated otherwise.
