# Twirla

A multi-tenant web app for Instagram/TikTok shops that provides interactive experience pages: wheel spin, tap hearts, scratch reveal, and countdown.

## Tech Stack

- **Backend**: ASP.NET Core 8 Minimal API (C#)
- **Frontend**: React + TypeScript + Vite
- **Communication**: REST API (JSON)

## Project Structure

```
Twirla/
├── backend/
│   └── Twirla.Api/          # ASP.NET Core API
├── frontend/                # React + TypeScript app
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/Twirla.Api
   ```

2. Restore dependencies and run:
   ```bash
   dotnet restore
   dotnet run
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Demo Shop IDs

The backend includes four demo configurations:

- `/p/demo-wheel` - Prize wheel experience
- `/p/demo-hearts` - Tap hearts mini-game
- `/p/demo-scratch` - Scratch to reveal
- `/p/demo-countdown` - Countdown timer

## API Endpoints

### GET /api/config/{shopId}

Returns the shop configuration for the given shop ID.

**Response**: `ShopConfig` JSON object

**Example**:
```bash
curl http://localhost:5000/api/config/demo-wheel
```

## Features

### Wheel Experience
- Weighted random prize selection
- Smooth spin animation
- Configurable repeat spins
- Result display with prize details

### Tap Hearts Experience
- Tap-to-collect hearts mini-game
- Progress tracking
- Floating heart animations
- Reveal screen after completion

### Scratch Experience
- Canvas-based scratch overlay
- Touch and mouse support
- Progressive reveal (30% threshold)
- Smooth animations

### Countdown Experience
- Real-time countdown timer
- Days/Hours/Minutes/Seconds display
- End state handling
- Configurable CTA visibility

## Configuration Model

Each shop has a `ShopConfig` that includes:

- **ShopId**: Unique identifier
- **Mode**: Experience type (Wheel, TapHearts, Scratch, Countdown)
- **Branding**: Colors, logo, brand name
- **Text**: Titles, subtitles, CTA text
- **CTA**: Call-to-action URL
- **Mode-specific config**: Settings for the selected experience mode

## Development Notes

- No database yet - configurations are stored in-memory
- Mobile-first responsive design
- CORS enabled for development
- TypeScript types mirror C# models for type safety

## Future Enhancements

- Database integration for persistent configs
- Admin UI for managing shop configurations
- Analytics tracking
- Additional experience modes
- User authentication for shop owners

