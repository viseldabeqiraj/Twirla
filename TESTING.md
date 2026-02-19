# Testing Guide for Twirla

## Prerequisites

Make sure you have:
- .NET 8 SDK installed
- Node.js and npm installed

## Step 1: Start the Backend API

Open a terminal and navigate to the backend:

```bash
cd backend/Twirla.Api
dotnet run
```

The API will start on `http://localhost:5000`

You should see output like:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

## Step 2: Start the Frontend Development Server

Open a **new terminal** and navigate to the frontend:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` (or another port if 3000 is busy)

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 3: Test in Browser

Open your browser and navigate to:

### Home Page
- `http://localhost:3000/` - Shows instructions and demo links

### Demo Shop Experiences

Try these demo shop IDs:

1. **Wheel Experience**
   - URL: `http://localhost:3000/p/demo-wheel`
   - Test: Click "Spin the Wheel!" button
   - Expected: Wheel spins, shows prize result

2. **Tap Hearts Experience**
   - URL: `http://localhost:3000/p/demo-hearts`
   - Test: Tap 10 hearts on screen
   - Expected: Progress bar fills, reveals discount message

3. **Scratch Experience**
   - URL: `http://localhost:3000/p/demo-scratch`
   - Test: Scratch/drag on the gray card area
   - Expected: Overlay reveals prize underneath

4. **Countdown Experience**
   - URL: `http://localhost:3000/p/demo-countdown`
   - Test: Watch the countdown timer
   - Expected: Timer counts down days/hours/minutes/seconds

## Step 4: Test API Directly

You can also test the API endpoints directly:

```bash
# Test wheel config
curl http://localhost:5000/api/config/demo-wheel

# Test hearts config
curl http://localhost:5000/api/config/demo-hearts

# Test scratch config
curl http://localhost:5000/api/config/demo-scratch

# Test countdown config
curl http://localhost:5000/api/config/demo-countdown

# Test invalid shop ID (should return 404)
curl http://localhost:5000/api/config/invalid-shop
```

## Testing Checklist

### Backend Tests
- [ ] API starts without errors
- [ ] GET /api/config/demo-wheel returns valid JSON
- [ ] GET /api/config/demo-hearts returns valid JSON
- [ ] GET /api/config/demo-scratch returns valid JSON
- [ ] GET /api/config/demo-countdown returns valid JSON
- [ ] GET /api/config/invalid-shop returns 404

### Frontend Tests
- [ ] Frontend dev server starts
- [ ] Home page loads correctly
- [ ] Wheel experience loads and spins work
- [ ] Tap hearts experience loads and tapping works
- [ ] Scratch experience loads and scratching works
- [ ] Countdown experience loads and timer updates
- [ ] Invalid shop ID shows error message
- [ ] CTA buttons link to correct URLs
- [ ] Branding colors apply correctly
- [ ] Mobile responsive (test on mobile or resize browser)

### Experience-Specific Tests

#### Wheel
- [ ] Wheel spins when button clicked
- [ ] Prize is selected based on weights
- [ ] Result screen shows after spin
- [ ] Repeat spins disabled when `allowRepeatSpins` is false
- [ ] CTA button appears after result

#### Tap Hearts
- [ ] Hearts appear on screen
- [ ] Tapping hearts increases count
- [ ] Progress bar updates
- [ ] Reveal screen shows after required taps
- [ ] Hearts animate (floating effect)

#### Scratch
- [ ] Scratch card shows overlay
- [ ] Dragging/touching reveals content
- [ ] Full reveal triggers at 30% scratch
- [ ] Result screen shows after reveal
- [ ] Works on both mouse and touch

#### Countdown
- [ ] Timer displays correctly
- [ ] Timer updates every second
- [ ] End state shows when countdown reaches zero
- [ ] CTA visibility respects `showCtaBeforeEnd` setting

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify .NET 8 SDK is installed: `dotnet --version`
- Try: `dotnet restore` then `dotnet build`

### Frontend won't start
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Try: `npm install` then `npm run dev`

### API returns 404
- Make sure backend is running
- Check the shop ID matches exactly (case-sensitive)
- Verify CORS is enabled (should be for development)

### Frontend can't connect to API
- Check backend is running on port 5000
- Check browser console for CORS errors
- Verify vite.config.ts proxy settings

### TypeScript errors in IDE
- Run `npm install` in frontend directory
- Restart your IDE/TypeScript server
- Run `npx tsc --noEmit` to verify compilation

## Quick Test Script

For quick testing, you can use this PowerShell script:

```powershell
# Start backend (in one terminal)
cd backend/Twirla.Api
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"

# Start frontend (in another terminal)
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait a moment, then open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000/p/demo-wheel"
```

