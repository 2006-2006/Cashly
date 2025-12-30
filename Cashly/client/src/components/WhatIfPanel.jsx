import { useState } from 'react';
import './WhatIfPanel.css';

const WhatIfPanel = ({ onApply, isLoading }) => {
    const [assumptions, setAssumptions] = useState({
        salesGrowthPercent: 0,
        collectionDelayDays: 0,
        paymentDelayDays: 0,
        expenseCutPercent: 0
    });

    const handleSliderChange = (key, value) => {
        setAssumptions(prev => ({
            ...prev,
            [key]: Number(value)
        }));
    };

    const handleApply = () => {
        onApply(assumptions);
    };

    const handleReset = () => {
        const reset = {
            salesGrowthPercent: 0,
            collectionDelayDays: 0,
            paymentDelayDays: 0,
            expenseCutPercent: 0
        };
        setAssumptions(reset);
        onApply(reset);
    };

    return (
        <div className="whatif-panel">
            <div className="panel-header">
                <h3>🎛️ What-If Simulator</h3>
                <p>Adjust assumptions and see the impact</p>
            </div>

            <div className="slider-group">
                <div className="slider-item">
                    <div className="slider-header">
                        <label>Sales Growth</label>
                        <span className={`slider-value ${assumptions.salesGrowthPercent >= 0 ? 'positive' : 'negative'}`}>
                            {assumptions.salesGrowthPercent > 0 ? '+' : ''}{assumptions.salesGrowthPercent}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-30"
                        max="30"
                        value={assumptions.salesGrowthPercent}
                        onChange={(e) => handleSliderChange('salesGrowthPercent', e.target.value)}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>-30%</span>
                        <span>0%</span>
                        <span>+30%</span>
                    </div>
                </div>

                <div className="slider-item">
                    <div className="slider-header">
                        <label>Customer Payment Delay</label>
                        <span className={`slider-value ${assumptions.collectionDelayDays <= 0 ? 'positive' : 'negative'}`}>
                            {assumptions.collectionDelayDays > 0 ? '+' : ''}{assumptions.collectionDelayDays} days
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-10"
                        max="30"
                        value={assumptions.collectionDelayDays}
                        onChange={(e) => handleSliderChange('collectionDelayDays', e.target.value)}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>-10 days</span>
                        <span>0</span>
                        <span>+30 days</span>
                    </div>
                </div>

                <div className="slider-item">
                    <div className="slider-header">
                        <label>Delay Supplier Payments</label>
                        <span className={`slider-value ${assumptions.paymentDelayDays >= 0 ? 'positive' : 'negative'}`}>
                            {assumptions.paymentDelayDays > 0 ? '+' : ''}{assumptions.paymentDelayDays} days
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-5"
                        max="30"
                        value={assumptions.paymentDelayDays}
                        onChange={(e) => handleSliderChange('paymentDelayDays', e.target.value)}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>-5 days</span>
                        <span>0</span>
                        <span>+30 days</span>
                    </div>
                </div>

                <div className="slider-item">
                    <div className="slider-header">
                        <label>Cut Expenses By</label>
                        <span className={`slider-value ${assumptions.expenseCutPercent >= 0 ? 'positive' : 'negative'}`}>
                            {assumptions.expenseCutPercent}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-10"
                        max="30"
                        value={assumptions.expenseCutPercent}
                        onChange={(e) => handleSliderChange('expenseCutPercent', e.target.value)}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>-10%</span>
                        <span>0%</span>
                        <span>+30%</span>
                    </div>
                </div>
            </div>

            <div className="panel-actions">
                <button className="btn-secondary" onClick={handleReset}>
                    Reset
                </button>
                <button className="btn-primary" onClick={handleApply} disabled={isLoading}>
                    {isLoading ? 'Calculating...' : 'Apply Changes'}
                </button>
            </div>
        </div>
    );
};

export default WhatIfPanel;
