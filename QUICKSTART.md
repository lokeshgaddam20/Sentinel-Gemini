# 🚀 Quick Start Guide - Corporate Copilot

Get up and running in **10 minutes**!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check Python (need 3.10+)
python3 --version

# Check npm
npm --version

# Check gcloud CLI
gcloud --version
```

If anything is missing, install it first!

## 1️⃣ Run Setup Script

```bash
# Clone the repo
git clone <your-repo-url>
cd corporate-copilot

# Run automated setup
chmod +x setup-dev.sh
./setup-dev.sh
```

This installs all dependencies for frontend, extension, and backend.

## 2️⃣ Set Up Google Cloud (5 minutes)

Follow these exact steps:

```bash
# 1. Login to GCP
gcloud auth login

# 2. Create project
gcloud projects create corporate-copilot-demo --name="Corporate Copilot"
gcloud config set project corporate-copilot-demo

# 3. Enable APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable dlp.googleapis.com

# 4. Authenticate
gcloud auth application-default login

# 5. Get your project ID
gcloud config get-value project
```

**📝 Note**: Save the project ID - you'll need it next!

## 3️⃣ Get OAuth Credentials (2 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Configure Consent Screen"
   - Choose "External" (for testing)
   - App name: **Corporate Copilot**
   - Your email for support/developer
3. Click "Create Credentials" → "OAuth Client ID"
   - Type: **Web application**
   - Name: **Corporate Copilot**
   - Redirect URI: `https://vscode.dev/redirect`
4. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

## 4️⃣ Configure Backend

Edit `backend/.env`:

```bash
cd backend
cp .env.example .env
nano .env  # or use your favorite editor
```

Update these values:
```env
PROJECT_ID=corporate-copilot-demo  # Your project ID from step 2
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com  # From step 3
ALLOWED_USERS=your.email@gmail.com  # Your Google account email
DLP_ENABLED=false  # Set to false for first test
```

Save and exit.

## 5️⃣ Start Backend

```bash
# Make sure you're in backend/
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Backend is running! Leave this terminal open.

## 6️⃣ Build Frontend

Open a **new terminal**:

```bash
cd frontend
nano .env  # Create .env file
```

Add this line:
```env
VITE_BACKEND_URL=http://localhost:8000
```

Build the frontend:
```bash
npm run build
```

This creates files in `extension/media/`

## 7️⃣ Test in VS Code

1. **Open VS Code** in the project root:
   ```bash
   code .
   ```

2. **Press F5** (or click "Run and Debug" → "Run Extension")

3. A new VS Code window opens (Extension Development Host)

4. In the new window:
   - Click the **Corporate Copilot icon** in the left sidebar
   - You'll see "Authenticating with Google..."
   - Sign in with your Google account
   - Start chatting!

## ✅ Test Questions

Try these to verify everything works:

1. "Write a Python function to reverse a string"
2. "Explain how React hooks work"
3. "Create a TypeScript interface for a user profile"

If you see responses, **congratulations!** 🎉

## 🐛 Troubleshooting

### "Authentication failed"
```bash
# Re-run this command
gcloud auth application-default login
```

### "User not authorized"
- Check `ALLOWED_USERS` in `backend/.env` matches your Google email
- Restart backend: `Ctrl+C` then `python main.py`

### "No response from AI"
```bash
# Test Vertex AI access
gcloud ai models list --region=us-central1
```

### "Module not found" (Python)
```bash
# Reinstall dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Cannot find module" (Node)
```bash
# Reinstall dependencies
cd extension
npm install
npm run compile
```

## 📊 Monitoring Costs

Check your free trial balance:
```bash
gcloud beta billing accounts list
```

Or visit: https://console.cloud.google.com/billing

## 🎯 Next Steps

- ✅ Working locally? Deploy to Cloud Run (see README.md)
- ✅ Want to customize? Edit the UI in `frontend/src/components/`
- ✅ Add more security? Enable DLP: `DLP_ENABLED=true`
- ✅ Team rollout? Package extension: `cd extension && vsce package`

## 📚 Documentation

- **Full README**: [README.md](./README.md)
- **GCP Setup Guide**: [GCP-SETUP.md](./GCP-SETUP.md)
- **Architecture**: See README.md

## 💬 Getting Help

- Check logs in backend terminal
- Check VS Code Developer Tools: `Help > Toggle Developer Tools`
- Review GCP-SETUP.md for detailed troubleshooting

---

**Estimated Time**: 10-15 minutes  
**Cost**: $0 (using free tier)  
**Difficulty**: Beginner-friendly