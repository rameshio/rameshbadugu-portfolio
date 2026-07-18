# Ramesh Badugu Portfolio

A full-stack portfolio built with React, Vite, Tailwind CSS, and a lightweight Node.js API. The interface uses a responsive liquid-glass visual system, while the backend handles contact validation, rate limiting, health checks, and server-side message delivery.

## Features

- Responsive liquid-glass UI with accessible fallbacks
- Portfolio, experience, skills, resume, and project case studies
- Keyboard-accessible navigation and project dialogs
- `POST /api/contact` with validation, honeypot spam protection, and rate limiting
- `GET /api/health` for deployment monitoring
- EmailJS delivery performed by the backend instead of exposing configuration in the client
- Node production server and Vercel serverless-function support
- Automated backend tests, ESLint, and production build verification

## Local development

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. The API runs on `http://localhost:8787`, and Vite proxies `/api` requests to it. Local development defaults to console-only contact delivery so test submissions are not sent externally.

## Environment variables

Copy `.env.example` to your deployment environment and configure:

```text
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
```

`EMAILJS_PRIVATE_KEY` is optional but recommended when supported by the EmailJS account. Do not enable `CONTACT_DELIVERY_MODE=console` in production.

## Production

```bash
npm run build
npm start
```

The Node server serves `dist/` and the API from one process. For Vercel, `api/contact.js` and `api/health.js` are deployed as serverless functions.

## Verification

```bash
npm run lint
npm test
npm run build
```
