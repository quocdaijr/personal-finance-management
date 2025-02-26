package models

// RegisterRequest represents the request body for user registration
type RegisterRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// LoginRequest represents the request body for user login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// TwoFactorRequest represents the request body for 2FA verification
type TwoFactorRequest struct {
	Username string `json:"username" binding:"required"`
	Token    string `json:"token" binding:"required,len=6"`
}

// PasswordResetRequest represents the request body for password reset
type PasswordResetRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// PasswordUpdateRequest represents the request body for password update
type PasswordUpdateRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// TokenResponse represents the response body for successful authentication
type TokenResponse struct {
	AccessToken    string        `json:"access_token"`
	RefreshToken   string        `json:"refresh_token"`
	AnalyticsToken string        `json:"analytics_token"`
	ExpiresIn      int64         `json:"expires_in"` // in seconds
	TokenType      string        `json:"token_type"`
	User           *UserResponse `json:"user"`
}

// RefreshTokenRequest represents the request body for token refresh
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// TwoFactorSetupResponse represents the response for 2FA setup
type TwoFactorSetupResponse struct {
	Secret     string `json:"secret"`
	QRCodeURL  string `json:"qr_code_url"`
}
