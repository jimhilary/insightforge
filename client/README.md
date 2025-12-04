# InsightForge Frontend

React + Vite frontend for the InsightForge application.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with the production build.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes (production) | Backend API base URL | `http://localhost:5000/api` |

**Note:** In production (Netlify), set `VITE_API_URL` to your Render backend URL:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## Deployment

📖 **See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed Netlify deployment instructions.**

## Project Structure

```
client/
├── public/
│   ├── _redirects      # Netlify SPA routing config
│   └── vite.svg
├── src/
│   ├── components/     # React components
│   ├── context/        # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities & Firebase config
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── store/          # Zustand state management
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
└── vite.config.js
```

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Firebase Auth** - Authentication
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Important Files

### `public/_redirects`
Required for Netlify SPA routing. Ensures all routes serve `index.html`.

### `src/services/api.js`
Main API configuration. Uses `VITE_API_URL` environment variable.

### `src/lib/firebase.js`
Firebase client configuration for authentication.

## Troubleshooting

**Build fails:**
- Ensure Node.js version is 20.19+ or 22.12+ (Vite requirement)
- Run `npm install` to ensure dependencies are installed
- Check for syntax errors in console

**API calls fail:**
- Verify `VITE_API_URL` is set correctly
- Check that backend is running and accessible
- Verify CORS is configured on backend

**Routing doesn't work on Netlify:**
- Ensure `public/_redirects` file exists with: `/* /index.html 200`

**Firebase auth errors:**
- Verify Firebase config in `src/lib/firebase.js`
- Check Firebase console for project settings
