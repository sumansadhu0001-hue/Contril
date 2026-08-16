export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateFromINR: number; // Conversion multiplier relative to INR
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateFromINR: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateFromINR: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateFromINR: 0.011 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateFromINR: 0.0094 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateFromINR: 0.044 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateFromINR: 0.016 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateFromINR: 0.018 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateFromINR: 0.016 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromINR: 1.85 }
};

class CurrencyService {
  private activeCurrencyCode: string = 'INR'; // India First Default

  constructor() {
    this.detectLocaleCurrency();
  }

  /**
   * Automatically detects user country/locale or defaults to INR.
   */
  public detectLocaleCurrency(userCountry?: string): string {
    if (userCountry) {
      const countryUpper = userCountry.trim().toUpperCase();
      if (countryUpper === 'INDIA' || countryUpper === 'IN') {
        this.activeCurrencyCode = 'INR';
        return 'INR';
      } else if (countryUpper === 'UNITED STATES' || countryUpper === 'US' || countryUpper === 'USA') {
        this.activeCurrencyCode = 'USD';
        return 'USD';
      } else if (countryUpper === 'UNITED KINGDOM' || countryUpper === 'UK' || countryUpper === 'GB') {
        this.activeCurrencyCode = 'GBP';
        return 'GBP';
      } else if (countryUpper === 'UAE' || countryUpper === 'UNITED ARAB EMIRATES') {
        this.activeCurrencyCode = 'AED';
        return 'AED';
      }
    }

    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (timeZone.includes('Asia/Kolkata') || timeZone.includes('Asia/Calcutta')) {
        this.activeCurrencyCode = 'INR';
        return 'INR';
      }
    } catch {
      // Fallback
    }

    // Default to INR per India First policy
    this.activeCurrencyCode = 'INR';
    return 'INR';
  }

  public setCurrency(code: string): void {
    if (SUPPORTED_CURRENCIES[code]) {
      this.activeCurrencyCode = code;
    }
  }

  public getActiveCurrency(): CurrencyConfig {
    return SUPPORTED_CURRENCIES[this.activeCurrencyCode] || SUPPORTED_CURRENCIES.INR;
  }

  /**
   * Formats INR base amount into active or requested currency.
   */
  public formatINR(amountInINR: number, currencyCode?: string): string {
    const currency = SUPPORTED_CURRENCIES[currencyCode || this.activeCurrencyCode] || SUPPORTED_CURRENCIES.INR;
    const converted = amountInINR * currency.rateFromINR;
    
    if (currency.code === 'INR') {
      return `${currency.symbol}${amountInINR.toLocaleString('en-IN')}`;
    }
    
    return `${currency.symbol}${converted.toLocaleString('en-US', {
      maximumFractionDigits: converted % 1 === 0 ? 0 : 2
    })}`;
  }

  /**
   * Return standardized budget tiers localized to active currency.
   */
  public getBudgetOptions(currencyCode?: string): string[] {
    const code = currencyCode || this.activeCurrencyCode;
    if (code === 'INR') {
      return ['Under ₹5,000', '₹5,000–₹15,000', '₹15,000–₹50,000', '₹50,000+'];
    } else if (code === 'USD') {
      return ['Under $60', '$60–180', '$180–600', '$600+'];
    } else if (code === 'EUR') {
      return ['Under €55', '€55–165', '€165–550', '€550+'];
    } else if (code === 'GBP') {
      return ['Under £45', '£45–140', '£140–470', '£470+'];
    } else if (code === 'AED') {
      return ['Under AED 220', 'AED 220–660', 'AED 660–2,200', 'AED 2,200+'];
    }
    return ['Under ₹5,000', '₹5,000–₹15,000', '₹15,000–₹50,000', '₹50,000+'];
  }
}

export const currencyService = new CurrencyService();
