# UBC Campus Finder

Simplifying navigation for utilities on campus. We make it easy to find stuff on campus.

## Features

- Interactive Google Maps integration showing UBC campus
- Real-time utility location tracking (water fountains, bike storage, washrooms, emergency facilities, food, charging stations)
- Category filtering and search functionality
- User feedback system for reporting broken utilities
- Mobile-responsive design with collapsible sidebar

## Setup

### Google Maps API Key

This app requires a Google Maps API key to display the interactive map.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create credentials (API Key)
5. Add the API key to your environment variables:

\`\`\`bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
\`\`\`

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Add these to your Vercel project or `.env.local` file:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Your Google Maps API key (required)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Google Maps JavaScript API
- @react-google-maps/api
