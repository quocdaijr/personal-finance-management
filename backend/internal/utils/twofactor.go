package utils

import (
	"github.com/pquerna/otp/totp"
)

// GenerateTOTPSecret generates a new TOTP secret
func GenerateTOTPSecret(username, issuer string) (*totp.Key, error) {
	// Generate a new TOTP key
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      issuer,
		AccountName: username,
	})
	if err != nil {
		return nil, err
	}

	return key, nil
}

// ValidateTOTP validates a TOTP token
func ValidateTOTP(token, secret string) bool {
	// Validate the token
	valid := totp.Validate(token, secret)
	return valid
}
