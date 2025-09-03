# Environment Setup for Frontend

## Required Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=FHG AI Email Bot
NEXT_PUBLIC_JWT_STORAGE_KEY=fhg_auth_token

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## How to Create the File

1. Navigate to the `frontend/` directory
2. Create a new file named `.env.local`
3. Copy and paste the above variables
4. Save the file

## Important Notes

- **NEXT_PUBLIC_ prefix**: All variables with this prefix are exposed to the browser
- **Local Development**: The default values are set for local development
- **Production**: Update these values for your production environment
- **Security**: Never commit `.env.local` to version control

## Variable Descriptions

- `NEXT_PUBLIC_API_BASE_URL`: Backend API endpoint
- `NEXT_PUBLIC_APP_NAME`: Application name displayed in the UI
- `NEXT_PUBLIC_JWT_STORAGE_KEY`: Key used to store JWT tokens in localStorage
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable/disable analytics features
- `NEXT_PUBLIC_ENABLE_DEBUG_MODE`: Enable/disable debug logging

## Backend Connection

Make sure your backend is running on `http://localhost:3000` or update the `NEXT_PUBLIC_API_BASE_URL` accordingly.
