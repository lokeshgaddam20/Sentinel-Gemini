# Google Cloud Platform Free Tier Setup Guide

## 🎯 Overview

This guide will walk you through setting up a **FREE** Google Cloud Platform account to test Corporate Copilot.

## 💰 What You Get for FREE

### Free Trial
- **$300 credits** valid for 90 days
- Access to all GCP services
- No automatic charges after trial ends

### Always Free Tier (After Trial)
- **Vertex AI**: First 50 requests/day FREE
- **Cloud Run**: 2 million requests/month FREE
- **DLP API**: 50,000 units/month FREE

## 📝 Step-by-Step Setup

### Step 1: Create Google Cloud Account

1. **Visit**: https://console.cloud.google.com/
2. **Click**: "Get started for free" or "Try for free"
3. **Sign in**: With your Google account (work or personal)
4. **Enter billing info**: Required but you won't be charged during trial
5. **Accept terms**: Review and accept Google Cloud Terms

> ⚠️ **Note**: You need a credit/debit card to verify identity, but you won't be auto-charged after the free trial ends.

### Step 2: Create a New Project

#### Via Console (Web Interface)
1. Go to [GCP Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "New Project"
4. Name: `corporate-copilot-demo`
5. Click "Create"

#### Via Command Line
```bash
# Install gcloud CLI first (if not installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Create project
gcloud projects create corporate-copilot-demo \
    --name="Corporate Copilot Demo"

# Set as active project
gcloud config set project corporate-copilot-demo

# Verify
gcloud config get-value project
```

### Step 3: Enable Billing (Free Trial)

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Link your free trial billing account to the project
3. Confirm you have $300 credits

### Step 4: Enable Required APIs

```bash
# Enable Vertex AI (for Gemini)
gcloud services enable aiplatform.googleapis.com

# Enable DLP (Data Loss Prevention)
gcloud services enable dlp.googleapis.com

# Enable Cloud Resource Manager
gcloud services enable cloudresourcemanager.googleapis.com

# Enable Identity and Access Management
gcloud services enable iam.googleapis.com

# Verify enabled services
gcloud services list --enabled
```

### Step 5: Set Up Authentication

#### For Local Development
```bash
# This creates application default credentials
gcloud auth application-default login

# Follow the browser prompt to authenticate
# This creates credentials at: ~/.config/gcloud/application_default_credentials.json
```

#### For Production (Service Account)
```bash
# Create service account
gcloud iam service-accounts create corporate-copilot \
    --display-name="Corporate Copilot Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding corporate-copilot-demo \
    --member="serviceAccount:corporate-copilot@corporate-copilot-demo.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding corporate-copilot-demo \
    --member="serviceAccount:corporate-copilot@corporate-copilot-demo.iam.gserviceaccount.com" \
    --role="roles/dlp.user"

# Create and download key
gcloud iam service-accounts keys create ~/corporate-copilot-key.json \
    --iam-account=corporate-copilot@corporate-copilot-demo.iam.gserviceaccount.com

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=~/corporate-copilot-key.json
```

### Step 6: Create OAuth 2.0 Credentials

This is needed for the VS Code extension to authenticate users.

1. **Go to**: [API Credentials](https://console.cloud.google.com/apis/credentials)

2. **Configure OAuth Consent Screen** (if not done):
   - Click "Configure Consent Screen"
   - User Type: **Internal** (for company) or **External** (for testing)
   - App name: **Corporate Copilot**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile`
   - Test users: Add your email (if external)
   - Click "Save and Continue"

3. **Create OAuth Client ID**:
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: **Corporate Copilot**
   - Authorized JavaScript origins: Leave empty
   - Authorized redirect URIs:
     - `https://vscode.dev/redirect`
     - `vscode://vscode.github-authentication/did-authenticate`
   - Click "Create"

4. **Copy Client ID**:
   - Copy the Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Save it to `backend/.env` as `GOOGLE_CLIENT_ID`

### Step 7: Test Vertex AI Access

```bash
# List available models
gcloud ai models list --region=us-central1

# You should see output including gemini-pro
```

If this works, you're ready to go! 🎉

## 🔍 Verify Your Setup

### Check Project Info
```bash
gcloud config list
```

### Check Enabled APIs
```bash
gcloud services list --enabled | grep -E "aiplatform|dlp"
```

### Check Billing
```bash
gcloud beta billing accounts list
```

### Test Vertex AI
```bash
# Simple test with gcloud
gcloud ai endpoints predict \
    --region=us-central1 \
    MODEL_ID \
    --json-request='{"prompt":"Hello"}'
```

## 💡 Cost Monitoring

### Set Up Budget Alerts

1. Go to [Billing → Budgets](https://console.cloud.google.com/billing/budgets)
2. Click "Create Budget"
3. Set amount: $10 (or any threshold)
4. Set alerts at 50%, 90%, 100%
5. Add your email for notifications

### Monitor Usage

```bash
# View current charges
gcloud beta billing accounts list

# View detailed billing
# Go to: https://console.cloud.google.com/billing
```

## 🚨 Staying Within Free Tier

### Vertex AI (Gemini)
- **FREE**: 50 requests/day
- **Cost after**: ~$0.00025 per 1k characters

**Tips**:
- Limit users with `ALLOWED_USERS`
- Set `MAX_TOKENS=2048` (reasonable limit)
- Monitor usage daily

### DLP API
- **FREE**: 50,000 units/month
- **Cost after**: $0.50 per 1,000 units

**Tips**:
- Use `DLP_ENABLED=false` during development
- Enable only for production
- One scan ≈ length of text in characters

### Cloud Run (If deployed)
- **FREE**: 2 million requests/month
- **FREE**: 360,000 GB-seconds compute
- **FREE**: 180,000 vCPU-seconds

**Tips**:
- Use `--max-instances 3` to limit scaling
- Use `--memory 512Mi` for small workloads

## 🔒 Security Best Practices

1. **Never commit credentials**:
   ```bash
   # Add to .gitignore
   echo "*.json" >> .gitignore
   echo ".env" >> .gitignore
   ```

2. **Rotate keys regularly**:
   ```bash
   # Delete old keys
   gcloud iam service-accounts keys list \
       --iam-account=YOUR_SERVICE_ACCOUNT
   
   gcloud iam service-accounts keys delete KEY_ID \
       --iam-account=YOUR_SERVICE_ACCOUNT
   ```

3. **Use least privilege**:
   - Only grant necessary roles
   - Avoid `roles/owner` in production

## 📞 Support & Troubleshooting

### Common Issues

#### "Permission denied" errors
```bash
# Re-authenticate
gcloud auth application-default login

# Or set credentials explicitly
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

#### "API not enabled"
```bash
# Check enabled services
gcloud services list --enabled

# Enable missing service
gcloud services enable SERVICE_NAME.googleapis.com
```

#### "Billing not enabled"
- Go to [Billing](https://console.cloud.google.com/billing)
- Link billing account to project

### Getting Help

- **GCP Documentation**: https://cloud.google.com/docs
- **Stack Overflow**: Tag questions with `google-cloud-platform`
- **GCP Support**: https://cloud.google.com/support

## ✅ Setup Checklist

- [ ] Created GCP account with $300 credits
- [ ] Created new project
- [ ] Enabled Vertex AI API
- [ ] Enabled DLP API
- [ ] Set up authentication (application default or service account)
- [ ] Created OAuth 2.0 credentials
- [ ] Configured environment variables
- [ ] Tested Vertex AI access
- [ ] Set up budget alerts

## 🎉 Next Steps

You're ready to run Corporate Copilot! Return to the main README.md to continue setup.