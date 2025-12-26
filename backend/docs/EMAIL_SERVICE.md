# Email Service Configuration

## Overview

The application uses SendGrid for production email delivery. In development mode without a SendGrid API key, emails are logged to the console instead of being sent.

## Setup

### 1. Get SendGrid API Key

1. Sign up for a SendGrid account at https://sendgrid.com
2. Navigate to Settings > API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the API key (you'll only see it once)

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Maglo Finance
BASE_URL=http://localhost:3000
```

### 3. Verify Sender Identity

Before sending emails in production, you need to verify your sender identity:

**Option 1: Single Sender Verification (Recommended for testing)**
1. Go to Settings > Sender Authentication > Single Sender Verification
2. Add and verify your FROM_EMAIL address
3. Check your email and click the verification link

**Option 2: Domain Authentication (Recommended for production)**
1. Go to Settings > Sender Authentication > Domain Authentication
2. Follow the wizard to authenticate your domain
3. Add the provided DNS records to your domain
4. Wait for verification (usually a few minutes)

## Email Templates

The service includes HTML and plain text templates for:

### 1. Password Reset Email
- **Subject:** Reset Your Password - {APP_NAME}
- **Trigger:** User requests password reset
- **Content:** Reset link with 1-hour expiration
- **Function:** `SendPasswordResetEmail(toEmail, token)`

### 2. Email Verification
- **Subject:** Verify Your Email - {APP_NAME}
- **Trigger:** User registers new account
- **Content:** Verification link with 24-hour expiration
- **Function:** `SendEmailVerification(toEmail, token)`

### 3. Welcome Email
- **Subject:** Welcome to {APP_NAME}
- **Trigger:** After successful registration
- **Content:** Welcome message with key features overview
- **Function:** `SendWelcomeEmail(toEmail, firstName)`

### 4. 2FA Setup Confirmation
- **Subject:** Two-Factor Authentication Enabled - {APP_NAME}
- **Trigger:** User enables 2FA
- **Content:** Security confirmation message
- **Function:** `Send2FASetupEmail(toEmail, firstName)`

## Development Mode

When `ENVIRONMENT=development` and `SENDGRID_API_KEY` is not set:
- Emails are logged to the console with full content
- No actual emails are sent
- Useful for local development and testing

Example console output:
```
========================================
EMAIL (Development Mode - No SendGrid Key)
========================================
To: User <user@example.com>
From: noreply@example.com
Subject: Welcome to Maglo Finance

Dear User,
...
========================================
```

## Production Deployment

### Docker Compose

Add to your `docker-compose.yml`:

```yaml
backend:
  environment:
    - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    - FROM_EMAIL=${FROM_EMAIL}
    - APP_NAME=Maglo Finance
    - BASE_URL=https://yourdomain.com
    - ENVIRONMENT=production
```

### Environment Variables File

Create `.env.production`:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
APP_NAME=Maglo Finance
BASE_URL=https://yourdomain.com
ENVIRONMENT=production
```

## Testing

### Test Email Delivery

```bash
# Start the backend
docker-compose up backend

# Trigger a password reset (example)
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Verify in SendGrid Dashboard

1. Go to Activity Feed in SendGrid dashboard
2. Check for recent email deliveries
3. Review delivery status and any errors

## Troubleshooting

### Common Issues

**1. "SENDGRID_API_KEY environment variable is not set"**
- Ensure `.env` file contains `SENDGRID_API_KEY`
- Restart the backend service after adding the key

**2. "Sendgrid error: status 401"**
- API key is invalid or expired
- Create a new API key in SendGrid dashboard

**3. "Sendgrid error: status 403"**
- Sender email not verified
- Complete sender authentication in SendGrid

**4. Emails not arriving**
- Check SendGrid Activity Feed for delivery status
- Verify recipient email is valid
- Check spam folder
- Review sender domain reputation

**5. Rate limiting (status 429)**
- Free tier: 100 emails/day
- Upgrade SendGrid plan for higher limits

## Rate Limits

### SendGrid Free Tier
- 100 emails per day
- Single sender verification only
- Email Activity Feed for 3 days

### Paid Plans
- Starting at 40,000 emails/month
- Domain authentication
- Extended activity feed
- Advanced analytics

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.env` files (added to `.gitignore`)
   - Use environment variables in production

2. **Rotate API keys regularly**
   - Create new keys every 90 days
   - Delete old keys immediately after rotation

3. **Use minimal permissions**
   - Only grant "Mail Send" permission
   - Don't use "Full Access" keys

4. **Monitor usage**
   - Set up alerts in SendGrid
   - Watch for unusual activity
   - Review Activity Feed regularly

## Cost Optimization

1. **Combine related emails**
   - Send digest emails instead of individual notifications
   - Batch non-urgent communications

2. **Implement email preferences**
   - Let users choose notification frequency
   - Respect unsubscribe requests immediately

3. **Monitor bounce rates**
   - Remove invalid email addresses
   - Maintain clean email lists

## Support

- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Support: https://support.sendgrid.com
- API Reference: https://docs.sendgrid.com/api-reference
