# Twirla API Backend

## Running the API

You don't need a solution (.sln) file to run this project. Simply run it from the project directory:

### Method 1: Using dotnet run (Recommended)

```bash
cd Twirla.Api
dotnet run
```

The API will start on `http://localhost:5000`

### Method 2: Using the executable

If you've already built the project:

```bash
cd Twirla.Api
dotnet build
.\bin\Debug\net8.0\Twirla.Api.exe
```

### Method 3: Using Visual Studio / Rider

1. Open the `Twirla.Api.csproj` file directly
2. Press F5 to run

## API Endpoints

- `GET /api/config/{shopId}` - Get shop configuration

### Demo Shop IDs:
- `demo-wheel`
- `demo-hearts`
- `demo-scratch`
- `demo-countdown`

## Example

```bash
# Start the API
cd Twirla.Api
dotnet run

# In another terminal, test the API
curl http://localhost:5000/api/config/demo-wheel
```

## Troubleshooting

If you get port conflicts:
- Change the port in `Properties/launchSettings.json`
- Or set environment variable: `ASPNETCORE_URLS=http://localhost:5001`

