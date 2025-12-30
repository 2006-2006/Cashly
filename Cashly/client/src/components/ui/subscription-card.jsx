import React from 'react';
import { Calendar } from 'lucide-react';

export function SubscriptionCard({
    name,
    plan,
    amount,
    nextRenewal,
    iconUrl,
    status = 'Active'
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-md cursor-pointer group">
            <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {iconUrl ? (
                        <img src={iconUrl} alt={name} className="w-8 h-8 object-contain" />
                    ) : (
                        <div className="text-xl font-bold text-gray-400">{name[0]}</div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 leading-tight">{name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{plan}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">₹{amount.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-500 font-medium">
                            Renews on {new Date(nextRenewal).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
