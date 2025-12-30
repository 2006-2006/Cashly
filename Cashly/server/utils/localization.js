// Translations for MSME-friendly terminology
const translations = {
    en: {
        // Common terms
        incoming: 'Incoming Money',
        outgoing: 'Outgoing Money',
        balance: 'Shop Balance',
        forecast: 'Cash Prediction',
        health: 'Business Health',

        // Dashboard
        todayBalance: "Today's Balance",
        expectedIn: 'Expected to Receive',
        expectedOut: 'Expected to Pay',

        // Alerts
        lowBalance: 'Low Balance Warning',
        largePayment: 'Large Payment Due',
        customerOwes: 'Customer Owes Money',

        // Actions
        collectPayment: 'Collect Payment',
        delayPayment: 'Delay Payment',
        reviewExpenses: 'Review Expenses',

        // Health scores
        healthy: 'Healthy',
        warning: 'Needs Attention',
        critical: 'Urgent Action Needed',

        // Time periods
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',

        // Categories
        sales: 'Sales',
        rent: 'Rent',
        salary: 'Salary',
        electricity: 'Electricity',
        inventory: 'Stock Purchase',
        general: 'General'
    },
    hi: {
        // Common terms
        incoming: 'आने वाला पैसा',
        outgoing: 'जाने वाला पैसा',
        balance: 'दुकान का बैलेंस',
        forecast: 'पैसे का अनुमान',
        health: 'बिज़नेस की स्थिति',

        // Dashboard
        todayBalance: 'आज का बैलेंस',
        expectedIn: 'मिलने वाला पैसा',
        expectedOut: 'देने वाला पैसा',

        // Alerts
        lowBalance: 'कम बैलेंस की चेतावनी',
        largePayment: 'बड़ा भुगतान आने वाला है',
        customerOwes: 'ग्राहक का बकाया',

        // Actions
        collectPayment: 'पैसा वसूल करें',
        delayPayment: 'भुगतान टालें',
        reviewExpenses: 'खर्चे देखें',

        // Health scores
        healthy: 'अच्छी स्थिति',
        warning: 'ध्यान दें',
        critical: 'तुरंत कार्रवाई करें',

        // Time periods
        today: 'आज',
        thisWeek: 'इस हफ्ते',
        thisMonth: 'इस महीने',

        // Categories
        sales: 'बिक्री',
        rent: 'किराया',
        salary: 'वेतन',
        electricity: 'बिजली',
        inventory: 'माल खरीद',
        general: 'सामान्य'
    },
    ta: {
        // Common terms
        incoming: 'வரும் பணம்',
        outgoing: 'செல்லும் பணம்',
        balance: 'கடை இருப்பு',
        forecast: 'பண கணிப்பு',
        health: 'வணிக நிலை',

        // Dashboard
        todayBalance: 'இன்றைய இருப்பு',
        expectedIn: 'வர வேண்டிய பணம்',
        expectedOut: 'கொடுக்க வேண்டிய பணம்',

        // Alerts
        lowBalance: 'குறைந்த இருப்பு எச்சரிக்கை',
        largePayment: 'பெரிய பணம் செலுத்த வேண்டும்',
        customerOwes: 'வாடிக்கையாளர் கடன்',

        // Actions
        collectPayment: 'பணம் வசூலிக்கவும்',
        delayPayment: 'பணம் செலுத்துவதை தாமதிக்கவும்',
        reviewExpenses: 'செலவுகளை பார்க்கவும்',

        // Health scores
        healthy: 'நல்ல நிலை',
        warning: 'கவனம் தேவை',
        critical: 'உடனடி நடவடிக்கை தேவை',

        // Time periods
        today: 'இன்று',
        thisWeek: 'இந்த வாரம்',
        thisMonth: 'இந்த மாதம்',

        // Categories
        sales: 'விற்பனை',
        rent: 'வாடகை',
        salary: 'சம்பளம்',
        electricity: 'மின்சாரம்',
        inventory: 'சரக்கு வாங்குதல்',
        general: 'பொது'
    }
};

// Get translation
const t = (key, lang = 'en') => {
    return translations[lang]?.[key] || translations.en[key] || key;
};

// Get all translations for a language
const getTranslations = (lang = 'en') => {
    return translations[lang] || translations.en;
};

// Format currency for Indian locale
const formatCurrency = (amount, lang = 'en') => {
    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);

    return formatted;
};

// Format date for Indian locale
const formatDate = (date, lang = 'en') => {
    const d = new Date(date);
    const locale = lang === 'hi' ? 'hi-IN' : (lang === 'ta' ? 'ta-IN' : 'en-IN');
    return d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

module.exports = {
    translations,
    t,
    getTranslations,
    formatCurrency,
    formatDate
};
