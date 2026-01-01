# Sentinel Gemini - Secure VS Code AI Assistant

A professional VS Code extension that provides a secure, monitored AI chat interface powered by Google Vertex AI Gemini.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  VS Code Ext    │────▶│  FastAPI Backend │────▶│  Vertex AI      │
│  (TypeScript)   │◀────│  (Python)        │◀────│  (Gemini Pro)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               ┌──────────────────┐
        │               │  Google Services │
        │               │  - Auth          │
        └──────────────▶│  - DLP           │
                        └──────────────────┘

┌─────────────────┐
│  React Webview  │
│  (Vite + React) │
└─────────────────┘
```

## 📋 Prerequisites

- **VS Code**: Version 1.85.0 or higher
- **Node.js**: Version 18+ and npm
- **Python**: Version 3.10+
- **Google Cloud Project**: With billing enabled
- **Git**: For cloning the repository

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sentinel-gemini
```

### 2. Set Up Google Cloud (FREE TIER)

See [GCP Setup Guide](#gcp-free-tier-setup) below.

### 3. Frontend Setup (React Webview)

```bash
cd frontend
npm install
cp .env.example .env

# Edit .env and set VITE_BACKEND_URL to your backend URL
# For local development: http://localhost:8000

npm run build
```

This will build the React app into `../extension/media/`

### 4. Extension Setup (VS Code)

```bash
cd ../extension
npm install
npm run compile
```

### 5. Backend Setup (Python)

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env

# Edit .env with your configuration
```

**Edit `.env` file:**

```env
PROJECT_ID=your-gcp-project-id
LOCATION=us-central1
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_USERS=your.email@company.com
DLP_ENABLED=true
```

### 6. Run the Backend

```bash
# Make sure you're authenticated with GCP
gcloud auth application-default login

# Start the server
python main.py
```

Server will run on `http://localhost:8000`

### 7. Test the Extension

1. Open VS Code
2. Press `F5` to open Extension Development Host
3. In the new window, click the Sentinel Gemini icon in the sidebar
4. Sign in with Google when prompted
5. Start chatting!

## 🆓 GCP Free Tier Setup

### Step 1: Create Free GCP Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Start Free" or "Try for Free"
3. You'll get:
   - **$300 free credits** valid for 90 days
   - Access to **Always Free** services after trial

### Step 2: Create a New Project

```bash
# Install gcloud CLI if you haven't
# Visit: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set as active project
gcloud config set project sentinel-gemini-demo

# Get project ID
gcloud config get-value project
```

### Step 3: Enable Required APIs

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable DLP API (Data Loss Prevention)
gcloud services enable dlp.googleapis.com

# Enable Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com
```

### Step 4: Set Up Authentication for Local Development

```bash
# Create application default credentials
gcloud auth application-default login

# This will open a browser for authentication
# Select your Google account and grant permissions
```

### Step 5: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click **Create Credentials > OAuth client ID**
4. If prompted, configure OAuth consent screen:
   - User Type: **Internal** (for company) or **External** (for testing)
   - App name: **Sentinel Gemini**
   - Support email: Your email
   - Scopes: Leave default
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Sentinel Gemini**
   - Authorized redirect URIs: `https://vscode.dev/redirect`
6. Copy the **Client ID** and save it to your `.env` file

### Step 6: Configure VS Code OAuth

VS Code has built-in Google authentication. You just need to ensure the extension requests the right scopes:

```typescript
// Already configured in extension/src/AuthManager.ts
const scopes = ['email', 'profile', 'openid'];
```

### Step 7: Test Your Setup

```bash
# Test Vertex AI access
gcloud ai models list --region=us-central1

# You should see available models including gemini-pro
```

## 💰 Cost Optimization (Free Tier Limits)

### Vertex AI Gemini Free Tier
- **FREE**: First 50 requests/day to Gemini Pro
- After: ~$0.00025 per 1k characters

### DLP Free Tier
- **FREE**: First 50,000 units/month
- After: $0.50 per 1,000 units

### Tips to Stay Free
1. Limit `ALLOWED_USERS` to just your team
2. Set reasonable `MAX_TOKENS` (2048 is good)
3. Monitor usage in GCP Console
4. Use DLP selectively (`DLP_ENABLED=false` for dev)

## 📝 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_ID` | Your GCP project ID | Required |
| `LOCATION` | GCP region for Vertex AI | `us-central1` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Required |
| `ALLOWED_USERS` | Comma-separated emails | Required |
| `DLP_ENABLED` | Enable DLP scanning | `true` |
| `MODEL_NAME` | Vertex AI model | `gemini-pro` |
| `MAX_TOKENS` | Max response length | `2048` |
| `TEMPERATURE` | Model creativity (0-1) | `0.7` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:8000` |

## 🧪 Testing

### Test Backend Directly

```bash
# Health check
curl http://localhost:8000/health

# Test chat (replace with your token)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a Python hello world",
    "token": "YOUR_GOOGLE_TOKEN"
  }'
```

### Test Extension

1. Open VS Code Extension Development Host
2. Open Sentinel Gemini sidebar
3. Try sample prompts:
   - "Write a Python function to reverse a string"
   - "Explain how async/await works in JavaScript"
   - "Create a React component for a todo list"

## 🔒 Security Features

✅ **Google OAuth** - Enterprise SSO integration  
✅ **RBAC** - Whitelist-based access control  
✅ **DLP Scanning** - Block sensitive data (SSN, credit cards)  
✅ **Audit Logging** - All requests logged  
✅ **CORS Protection** - Restricted origins  
✅ **Token Validation** - Verify all requests  

## 📦 Building for Production

### Package the Extension

```bash
cd extension
npm install -g @vscode/vsce
vsce package
```

This creates `sentinel-gemini-1.0.0.vsix`

### Deploy Backend to Cloud Run

```bash
cd backend

# Create Dockerfile (see deployment folder)
docker build -t gcr.io/YOUR_PROJECT_ID/sentinel-gemini .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/sentinel-gemini

# Deploy to Cloud Run
gcloud run deploy sentinel-gemini \
  --image gcr.io/YOUR_PROJECT_ID/sentinel-gemini \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=YOUR_PROJECT_ID
```

## 🐛 Troubleshooting

### "Authentication failed"
- Ensure you've run `gcloud auth application-default login`
- Check `GOOGLE_CLIENT_ID` is correct
- Verify OAuth consent screen is configured

### "User not authorized"
- Add your email to `ALLOWED_USERS` in `.env`
- Restart the backend server

### "DLP scan failed"
- Ensure DLP API is enabled: `gcloud services enable dlp.googleapis.com`
- Or disable DLP: `DLP_ENABLED=false`

### "No response from Vertex AI"
- Verify Vertex AI API is enabled
- Check you're in a supported region (`us-central1`)
- Ensure billing is enabled on your project

## 📚 Project Structure

```
sentinel-gemini/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # React hooks
│   │   ├── types/       # TypeScript types
│   │   └── styles/      # CSS files
│   └── vite.config.ts
├── extension/           # VS Code extension
│   ├── src/
│   │   ├── SidebarProvider.ts
│   │   ├── AuthManager.ts
│   │   └── extension.ts
│   └── package.json
└── backend/            # Python FastAPI
    ├── routers/        # API endpoints
    ├── services/       # Business logic
    ├── models/         # Data models
    └── main.py
```

## 🎯 Next Steps

- [ ] Add file upload support
- [ ] Implement conversation history
- [ ] Add workspace context awareness
- [ ] Create admin dashboard
- [ ] Add team analytics

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.