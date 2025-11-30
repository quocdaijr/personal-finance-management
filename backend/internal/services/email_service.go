package services

import (
	"fmt"
	"log"
)

// EmailService handles email sending operations
// This is a mock implementation - replace with actual email service (SendGrid, AWS SES, etc.)
type EmailService struct {
	fromEmail   string
	appName     string
	baseURL     string
	environment string
}

// NewEmailService creates a new email service
func NewEmailService(fromEmail, appName, baseURL, environment string) *EmailService {
	return &EmailService{
		fromEmail:   fromEmail,
		appName:     appName,
		baseURL:     baseURL,
		environment: environment,
	}
}

// SendPasswordResetEmail sends a password reset email
func (s *EmailService) SendPasswordResetEmail(toEmail, token string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", s.baseURL, token)

	// In development, just log the email
	if s.environment == "development" {
		log.Printf(`
========================================
PASSWORD RESET EMAIL (Development Mode)
========================================
To: %s
From: %s
Subject: Reset Your Password - %s

Dear User,

You have requested to reset your password. Click the link below to reset your password:

%s

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
%s Team
========================================
`, toEmail, s.fromEmail, s.appName, resetURL, s.appName)
		return nil
	}

	// TODO: Implement actual email sending using SendGrid, AWS SES, SMTP, etc.
	// Example with SendGrid:
	// client := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
	// message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	// response, err := client.Send(message)

	log.Printf("Would send password reset email to %s with token %s", toEmail, token)
	return nil
}

// SendEmailVerification sends an email verification email
func (s *EmailService) SendEmailVerification(toEmail, token string) error {
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", s.baseURL, token)

	// In development, just log the email
	if s.environment == "development" {
		log.Printf(`
========================================
EMAIL VERIFICATION (Development Mode)
========================================
To: %s
From: %s
Subject: Verify Your Email - %s

Dear User,

Thank you for registering with %s. Please click the link below to verify your email address:

%s

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
%s Team
========================================
`, toEmail, s.fromEmail, s.appName, s.appName, verifyURL, s.appName)
		return nil
	}

	// TODO: Implement actual email sending
	log.Printf("Would send email verification to %s with token %s", toEmail, token)
	return nil
}

// SendWelcomeEmail sends a welcome email after successful registration
func (s *EmailService) SendWelcomeEmail(toEmail, firstName string) error {
	if s.environment == "development" {
		log.Printf(`
========================================
WELCOME EMAIL (Development Mode)
========================================
To: %s
Subject: Welcome to %s

Dear %s,

Welcome to %s! Your account has been successfully created.

Best regards,
%s Team
========================================
`, toEmail, s.appName, firstName, s.appName, s.appName)
		return nil
	}

	log.Printf("Would send welcome email to %s", toEmail)
	return nil
}

