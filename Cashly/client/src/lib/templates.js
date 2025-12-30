export const templates = {
    kirana: {
        name: 'Kirana Store',
        type: 'Retail',
        categories: {
            income: ['Cash Sales', 'UPI Sales', 'Credit Sales', 'Returns Refund'],
            expense: ['Stock Purchase', 'Rent', 'Electricity', 'Staff Salary', 'Transport', 'Packaging', 'Miscellaneous']
        },
        recurringExpenses: [
            { category: 'Rent', frequency: 'Monthly', typical: 15000 },
            { category: 'Electricity', frequency: 'Monthly', typical: 3000 },
            { category: 'Staff Salary', frequency: 'Monthly', typical: 12000 }
        ],
        tips: [
            'Track daily cash sales every evening',
            'Keep stock purchases separate from personal expenses',
            'Collect credit dues within 15 days'
        ]
    },
    salon: {
        name: 'Salon / Beauty Parlour',
        type: 'Service',
        categories: {
            income: ['Haircut', 'Facial', 'Spa', 'Products Sale', 'Membership'],
            expense: ['Rent', 'Electricity', 'Staff Salary', 'Products', 'Equipment', 'Marketing', 'Miscellaneous']
        },
        recurringExpenses: [
            { category: 'Rent', frequency: 'Monthly', typical: 20000 },
            { category: 'Electricity', frequency: 'Monthly', typical: 5000 },
            { category: 'Staff Salary', frequency: 'Monthly', typical: 25000 },
            { category: 'Products', frequency: 'Monthly', typical: 10000 }
        ],
        tips: [
            'Offer memberships for steady income',
            'Track product usage vs revenue',
            'Festival seasons are peak - stock up beforehand'
        ]
    },
    manufacturer: {
        name: 'Small Manufacturer',
        type: 'Manufacturing',
        categories: {
            income: ['Product Sales', 'Bulk Orders', 'Export Sales', 'Scrap Sales'],
            expense: ['Raw Material', 'Rent', 'Electricity', 'Labor', 'Transport', 'Packaging', 'Machine Maintenance', 'Miscellaneous']
        },
        recurringExpenses: [
            { category: 'Rent', frequency: 'Monthly', typical: 25000 },
            { category: 'Electricity', frequency: 'Monthly', typical: 15000 },
            { category: 'Labor', frequency: 'Monthly', typical: 50000 },
            { category: 'Machine Maintenance', frequency: 'Monthly', typical: 5000 }
        ],
        tips: [
            'Get 30-50% advance on large orders',
            'Electricity is usually highest cost - track it',
            'Maintain 2-month raw material buffer'
        ]
    },
    restaurant: {
        name: 'Restaurant / Food Business',
        type: 'Retail',
        categories: {
            income: ['Dine-in', 'Parcel', 'Delivery Apps', 'Catering'],
            expense: ['Raw Material', 'Rent', 'Electricity', 'Gas', 'Staff Salary', 'Delivery', 'Packaging', 'Miscellaneous']
        },
        recurringExpenses: [
            { category: 'Rent', frequency: 'Monthly', typical: 30000 },
            { category: 'Electricity', frequency: 'Monthly', typical: 8000 },
            { category: 'Gas', frequency: 'Monthly', typical: 5000 },
            { category: 'Staff Salary', frequency: 'Monthly', typical: 40000 }
        ],
        tips: [
            'Weekend sales are usually 2x weekday - plan stock',
            'Food cost should be 30-35% of sales',
            'Track waste separately'
        ]
    },
    trader: {
        name: 'Trading Business',
        type: 'Trading',
        categories: {
            income: ['Sales', 'Commission', 'Bulk Discount'],
            expense: ['Stock Purchase', 'Rent', 'Transport', 'Staff Salary', 'Godown Rent', 'Insurance', 'Miscellaneous']
        },
        recurringExpenses: [
            { category: 'Rent', frequency: 'Monthly', typical: 20000 },
            { category: 'Transport', frequency: 'Monthly', typical: 10000 },
            { category: 'Staff Salary', frequency: 'Monthly', typical: 20000 }
        ],
        tips: [
            'Collect 50% advance on credit orders',
            'Maintain customer-wise credit limits',
            'Quarterly GST payments - keep buffer'
        ]
    }
};

export const getTemplate = (key) => templates[key] || null;

export const getAllTemplates = () => Object.entries(templates).map(([key, template]) => ({
    key,
    name: template.name,
    type: template.type
}));
