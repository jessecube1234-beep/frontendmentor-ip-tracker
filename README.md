# Frontend Mentor - IP Address Tracker

A React + Vite solution to the Frontend Mentor IP Address Tracker challenge.

<img width="1912" height="946" alt="image" src="https://github.com/user-attachments/assets/5a1f8d0b-703a-46d2-94a9-345fe4e076cf" />


## Overview

This app lets users search by IPv4 address or domain and view:

- IP address
- Location
- Timezone
- ISP
- Map location marker

## Built With

- React
- Vite
- Leaflet
- ESLint
- Vitest + Testing Library

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variable

Create a `.env` file in the project root:

```env
VITE_IPIFY_API_KEY=your_api_key_here
```

You can use `.env.example` as a template.

### 3. Run locally

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test -- --run` - Run tests once

## Testing

This project includes unit/integration tests for:

- input validation
- successful lookup rendering
- API error handling

Run tests with:

```bash
npm test -- --run
```

## CI

GitHub Actions runs:

- lint
- test

on `push` and `pull_request` for `main` and `dev`.

## Notes

- API lookups use the IPify Geo API.
- `.env` is ignored by Git for security.
- Add your screenshot directly in GitHub README editor when ready.
