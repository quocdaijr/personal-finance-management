package services

import (
	"fmt"
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

// EmailService handles email sending operations
type EmailService struct {
	fromEmail   string
	appName     string
	baseURL     string
	environment string
	sendGridKey string
}

// NewEmailService creates a new email service
func NewEmailService(fromEmail, appName, baseURL, environment string) *EmailService {
	return &EmailService{
		fromEmail:   fromEmail,
		appName:     appName,
		baseURL:     baseURL,
		environment: environment,
		sendGridKey: os.Getenv("SENDGRID_API_KEY"),
	}
}

// sendEmail sends an email using SendGrid
func (s *EmailService) sendEmail(toEmail, toName, subject, plainContent, htmlContent string) error {
	// In development mode without SendGrid key, just log
	if s.environment == "development" && s.sendGridKey == "" {
		log.Printf(`
========================================
EMAIL (Development Mode - No SendGrid Key)
========================================
To: %s <%s>
From: %s
Subject: %s

%s
========================================
`, toName, toEmail, s.fromEmail, subject, plainContent)
		return nil
	}

	// Validate SendGrid API key
	if s.sendGridKey == "" {
		return fmt.Errorf("SENDGRID_API_KEY environment variable is not set")
	}

	// Create email
	from := mail.NewEmail(s.appName, s.fromEmail)
	to := mail.NewEmail(toName, toEmail)
	message := mail.NewSingleEmail(from, subject, to, plainContent, htmlContent)

	// Send email
	client := sendgrid.NewSendClient(s.sendGridKey)
	response, err := client.Send(message)
	if err != nil {
		log.Printf("Failed to send email to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	// Check response status
	if response.StatusCode >= 400 {
		log.Printf("SendGrid returned error status %d for email to %s: %s", response.StatusCode, toEmail, response.Body)
		return fmt.Errorf("sendgrid error: status %d", response.StatusCode)
	}

	log.Printf("Email sent successfully to %s (Status: %d)", toEmail, response.StatusCode)
	return nil
}

// SendPasswordResetEmail sends a password reset email
func (s *EmailService) SendPasswordResetEmail(toEmail, token string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", s.baseURL, token)

	subject := fmt.Sprintf("Reset Your Password - %s", s.appName)

	plainContent := fmt.Sprintf(`Dear User,

You have requested to reset your password. Click the link below to reset your password:

%s

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
%s Team`, resetURL, s.appName)

	htmlContent := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #007bff; margin-top: 0;">Reset Your Password</h2>
    </div>

    <p>Dear User,</p>

    <p>You have requested to reset your password. Click the button below to reset your password:</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="%s" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
    </div>

    <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
    <p style="background-color: #f8f9fa; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">%s</p>

    <p style="color: #dc3545; font-weight: bold;">This link will expire in 1 hour.</p>

    <p>If you did not request this password reset, please ignore this email.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 12px; text-align: center;">
        Best regards,<br>
        <strong>%s Team</strong>
    </p>
</body>
</html>`, resetURL, resetURL, s.appName)

	return s.sendEmail(toEmail, "User", subject, plainContent, htmlContent)
}

// SendEmailVerification sends an email verification email
func (s *EmailService) SendEmailVerification(toEmail, token string) error {
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", s.baseURL, token)

	subject := fmt.Sprintf("Verify Your Email - %s", s.appName)

	plainContent := fmt.Sprintf(`Dear User,

Thank you for registering with %s. Please click the link below to verify your email address:

%s

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
%s Team`, s.appName, verifyURL, s.appName)

	htmlContent := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #28a745; margin-top: 0;">Verify Your Email Address</h2>
    </div>

    <p>Dear User,</p>

    <p>Thank you for registering with <strong>%s</strong>. Please click the button below to verify your email address:</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="%s" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
    </div>

    <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
    <p style="background-color: #f8f9fa; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">%s</p>

    <p style="color: #ffc107; font-weight: bold;">This link will expire in 24 hours.</p>

    <p>If you did not create an account, please ignore this email.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 12px; text-align: center;">
        Best regards,<br>
        <strong>%s Team</strong>
    </p>
</body>
</html>`, s.appName, verifyURL, verifyURL, s.appName)

	return s.sendEmail(toEmail, "User", subject, plainContent, htmlContent)
}

// SendWelcomeEmail sends a welcome email after successful registration
func (s *EmailService) SendWelcomeEmail(toEmail, firstName string) error {
	subject := fmt.Sprintf("Welcome to %s", s.appName)

	userName := firstName
	if userName == "" {
		userName = "User"
	}

	plainContent := fmt.Sprintf(`Dear %s,

Welcome to %s! Your account has been successfully created.

We're excited to have you on board. You can now start managing your finances with our comprehensive tools and features.

Key features you can explore:
- Track your transactions and expenses
- Manage multiple accounts and cards
- Set budgets and financial goals
- Generate detailed financial reports
- Monitor your financial health

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
%s Team`, userName, s.appName, s.appName)

	htmlContent := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to %s</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #007bff; color: white; padding: 30px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">Welcome to %s! 🎉</h1>
    </div>

    <p>Dear <strong>%s</strong>,</p>

    <p>Welcome to <strong>%s</strong>! Your account has been successfully created.</p>

    <p>We're excited to have you on board. You can now start managing your finances with our comprehensive tools and features.</p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #007bff;">Key Features You Can Explore:</h3>
        <ul style="line-height: 2;">
            <li>📊 Track your transactions and expenses</li>
            <li>💳 Manage multiple accounts and cards</li>
            <li>🎯 Set budgets and financial goals</li>
            <li>📈 Generate detailed financial reports</li>
            <li>💰 Monitor your financial health</li>
        </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="%s" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Get Started</a>
    </div>

    <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 12px; text-align: center;">
        Best regards,<br>
        <strong>%s Team</strong>
    </p>
</body>
</html>`, s.appName, s.appName, userName, s.appName, s.baseURL, s.appName)

	return s.sendEmail(toEmail, userName, subject, plainContent, htmlContent)
}

// Send2FASetupEmail sends an email when 2FA is enabled
func (s *EmailService) Send2FASetupEmail(toEmail, firstName string) error {
	subject := fmt.Sprintf("Two-Factor Authentication Enabled - %s", s.appName)

	userName := firstName
	if userName == "" {
		userName = "User"
	}

	plainContent := fmt.Sprintf(`Dear %s,

Two-factor authentication has been successfully enabled on your %s account.

Your account is now more secure with an additional layer of protection. You will need to enter a verification code from your authenticator app each time you log in.

If you did not enable two-factor authentication, please contact our support team immediately.

Best regards,
%s Team`, userName, s.appName, s.appName)

	htmlContent := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Enabled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="margin: 0;">🔒 Two-Factor Authentication Enabled</h2>
    </div>

    <p>Dear <strong>%s</strong>,</p>

    <p>Two-factor authentication has been successfully enabled on your <strong>%s</strong> account.</p>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #155724;">✅ Your account is now more secure with an additional layer of protection.</p>
    </div>

    <p>You will need to enter a verification code from your authenticator app each time you log in.</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">⚠️ If you did not enable two-factor authentication, please contact our support team immediately.</p>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 12px; text-align: center;">
        Best regards,<br>
        <strong>%s Team</strong>
    </p>
</body>
</html>`, userName, s.appName, s.appName)

	return s.sendEmail(toEmail, userName, subject, plainContent, htmlContent)
}
