package models

// Currency represents a supported currency
type Currency struct {
	Code     string  `json:"code"`
	Name     string  `json:"name"`
	Symbol   string  `json:"symbol"`
	Decimals int     `json:"decimals"`
	Rate     float64 `json:"rate"` // Exchange rate to USD
}

// SupportedCurrencies returns the list of supported currencies
func SupportedCurrencies() []Currency {
	return []Currency{
		{Code: "USD", Name: "US Dollar", Symbol: "$", Decimals: 2, Rate: 1.0},
		{Code: "EUR", Name: "Euro", Symbol: "€", Decimals: 2, Rate: 0.92},
		{Code: "GBP", Name: "British Pound", Symbol: "£", Decimals: 2, Rate: 0.79},
		{Code: "JPY", Name: "Japanese Yen", Symbol: "¥", Decimals: 0, Rate: 149.50},
		{Code: "CNY", Name: "Chinese Yuan", Symbol: "¥", Decimals: 2, Rate: 7.24},
		{Code: "INR", Name: "Indian Rupee", Symbol: "₹", Decimals: 2, Rate: 83.12},
		{Code: "AUD", Name: "Australian Dollar", Symbol: "A$", Decimals: 2, Rate: 1.53},
		{Code: "CAD", Name: "Canadian Dollar", Symbol: "C$", Decimals: 2, Rate: 1.36},
		{Code: "CHF", Name: "Swiss Franc", Symbol: "CHF", Decimals: 2, Rate: 0.88},
		{Code: "KRW", Name: "South Korean Won", Symbol: "₩", Decimals: 0, Rate: 1298.50},
		{Code: "SGD", Name: "Singapore Dollar", Symbol: "S$", Decimals: 2, Rate: 1.34},
		{Code: "HKD", Name: "Hong Kong Dollar", Symbol: "HK$", Decimals: 2, Rate: 7.82},
		{Code: "NZD", Name: "New Zealand Dollar", Symbol: "NZ$", Decimals: 2, Rate: 1.63},
		{Code: "SEK", Name: "Swedish Krona", Symbol: "kr", Decimals: 2, Rate: 10.42},
		{Code: "MXN", Name: "Mexican Peso", Symbol: "MX$", Decimals: 2, Rate: 17.15},
		{Code: "BRL", Name: "Brazilian Real", Symbol: "R$", Decimals: 2, Rate: 4.97},
		{Code: "VND", Name: "Vietnamese Dong", Symbol: "₫", Decimals: 0, Rate: 24500.00},
		{Code: "THB", Name: "Thai Baht", Symbol: "฿", Decimals: 2, Rate: 35.50},
		{Code: "MYR", Name: "Malaysian Ringgit", Symbol: "RM", Decimals: 2, Rate: 4.72},
		{Code: "PHP", Name: "Philippine Peso", Symbol: "₱", Decimals: 2, Rate: 55.80},
		{Code: "IDR", Name: "Indonesian Rupiah", Symbol: "Rp", Decimals: 0, Rate: 15650.00},
	}
}

// GetCurrencyByCode returns a currency by its code
func GetCurrencyByCode(code string) *Currency {
	for _, c := range SupportedCurrencies() {
		if c.Code == code {
			return &c
		}
	}
	return nil
}

// ConvertAmount converts an amount from one currency to another
func ConvertAmount(amount float64, fromCurrency, toCurrency string) float64 {
	if fromCurrency == toCurrency {
		return amount
	}

	from := GetCurrencyByCode(fromCurrency)
	to := GetCurrencyByCode(toCurrency)

	if from == nil || to == nil {
		return amount // Return original if currencies not found
	}

	// Convert to USD first, then to target currency
	usdAmount := amount / from.Rate
	return usdAmount * to.Rate
}

// FormatAmount formats an amount with the currency symbol
func FormatAmount(amount float64, currencyCode string) string {
	currency := GetCurrencyByCode(currencyCode)
	if currency == nil {
		return "$" + formatNumber(amount, 2)
	}
	return currency.Symbol + formatNumber(amount, currency.Decimals)
}

func formatNumber(amount float64, decimals int) string {
	format := "%." + string(rune('0'+decimals)) + "f"
	return string([]byte(format))
}

