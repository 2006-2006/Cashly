import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const translations = {
    en: {
        incoming: 'Incoming Money',
        outgoing: 'Outgoing Money',
        balance: 'Shop Balance',
        forecast: 'Cash Prediction',
        health: 'Business Health',
        todayBalance: "Today's Balance",
        expectedIn: 'Expected to Receive',
        expectedOut: 'Expected to Pay',
        lowBalance: 'Low Balance Warning',
        largePayment: 'Large Payment Due',
        customerOwes: 'Customer Owes Money',
        collectPayment: 'Collect Payment',
        delayPayment: 'Delay Payment',
        reviewExpenses: 'Review Expenses',
        healthy: 'Healthy',
        warning: 'Needs Attention',
        critical: 'Urgent Action Needed',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        sales: 'Sales',
        rent: 'Rent',
        salary: 'Salary',
        electricity: 'Electricity',
        inventory: 'Stock Purchase',
        general: 'General',
        dashboard: 'Dashboard',
        income: 'Income',
        expenses: 'Expenses',
        upload: 'Upload Data',
        settings: 'Settings',
        logout: 'Logout'
    },
    hi: {
        incoming: 'आने वाला पैसा',
        outgoing: 'जाने वाला पैसा',
        balance: 'दुकान का बैलेंस',
        forecast: 'पैसे का अनुमान',
        health: 'बिज़नेस की स्थिति',
        todayBalance: 'आज का बैलेंस',
        expectedIn: 'मिलने वाला पैसा',
        expectedOut: 'देने वाला पैसा',
        lowBalance: 'कम बैलेंस की चेतावनी',
        largePayment: 'बड़ा भुगतान आने वाला है',
        customerOwes: 'ग्राहक का बकाया',
        collectPayment: 'पैसा वसूल करें',
        delayPayment: 'भुगतान टालें',
        reviewExpenses: 'खर्चे देखें',
        healthy: 'अच्छी स्थिति',
        warning: 'ध्यान दें',
        critical: 'तुरंत कार्रवाई करें',
        today: 'आज',
        thisWeek: 'इस हफ्ते',
        thisMonth: 'इस महीने',
        sales: 'बिक्री',
        rent: 'किराया',
        salary: 'वेतन',
        electricity: 'बिजली',
        inventory: 'माल खरीद',
        general: 'सामान्य',
        dashboard: 'डैशबोर्ड',
        income: 'आमदनी',
        expenses: 'खर्चे',
        upload: 'डेटा अपलोड',
        settings: 'सेटिंग्स',
        logout: 'लॉग आउट'
    },
    ta: {
        incoming: 'வரும் பணம்',
        outgoing: 'செல்லும் பணம்',
        balance: 'கடை இருப்பு',
        forecast: 'பண கணிப்பு',
        health: 'வணிக நிலை',
        todayBalance: 'இன்றைய இருப்பு',
        expectedIn: 'வர வேண்டிய பணம்',
        expectedOut: 'கொடுக்க வேண்டிய பணம்',
        lowBalance: 'குறைந்த இருப்பு எச்சரிக்கை',
        largePayment: 'பெரிய பணம் செலுத்த வேண்டும்',
        customerOwes: 'வாடிக்கையாளர் கடன்',
        collectPayment: 'பணம் வசூலிக்கவும்',
        delayPayment: 'பணம் செலுத்துவதை தாமதிக்கவும்',
        reviewExpenses: 'செலவுகளை பார்க்கவும்',
        healthy: 'நல்ல நிலை',
        warning: 'கவனம் தேவை',
        critical: 'உடனடி நடவடிக்கை தேவை',
        today: 'இன்று',
        thisWeek: 'இந்த வாரம்',
        thisMonth: 'இந்த மாதம்',
        sales: 'விற்பனை',
        rent: 'வாடகை',
        salary: 'சம்பளம்',
        electricity: 'மின்சாரம்',
        inventory: 'சரக்கு வாங்குதல்',
        general: 'பொது',
        dashboard: 'டாஷ்போர்டு',
        income: 'வருமானம்',
        expenses: 'செலவுகள்',
        upload: 'தரவு பதிவேற்றம்',
        settings: 'அமைப்புகள்',
        logout: 'வெளியேறு'
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations.en[key] || key;
    };

    const changeLanguage = (lang) => {
        if (['en', 'hi', 'ta'].includes(lang)) {
            setLanguage(lang);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, t, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
