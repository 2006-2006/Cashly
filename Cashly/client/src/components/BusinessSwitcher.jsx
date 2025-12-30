import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import './BusinessSwitcher.css';

const BusinessSwitcher = () => {
    const { businesses, selectedBusiness, selectBusiness } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    if (!businesses || businesses.length === 0) {
        return (
            <div className="business-switcher">
                <button className="switcher-btn add-btn" onClick={() => navigate('/setup')}>
                    <span className="add-icon">+</span>
                    <span>Add Business</span>
                </button>
            </div>
        );
    }

    return (
        <div className="business-switcher">
            <button className="switcher-btn" onClick={() => setIsOpen(!isOpen)}>
                <span className="business-icon">🏪</span>
                <span className="business-name">{selectedBusiness?.name || 'Select Business'}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="switcher-dropdown">
                    {businesses.map(business => (
                        <div
                            key={business._id}
                            className={`dropdown-item ${selectedBusiness?._id === business._id ? 'active' : ''}`}
                            onClick={() => {
                                selectBusiness(business);
                                setIsOpen(false);
                            }}
                        >
                            <span className="item-icon">
                                {business.type === 'Retail' && '🏪'}
                                {business.type === 'Service' && '💼'}
                                {business.type === 'Manufacturing' && '🏭'}
                                {business.type === 'Trading' && '📦'}
                                {!['Retail', 'Service', 'Manufacturing', 'Trading'].includes(business.type) && '🏢'}
                            </span>
                            <div className="item-info">
                                <span className="item-name">{business.name}</span>
                                <span className="item-type">{business.type}</span>
                            </div>
                            {selectedBusiness?._id === business._id && (
                                <span className="check-mark">✓</span>
                            )}
                        </div>
                    ))}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item add-new" onClick={() => { navigate('/setup'); setIsOpen(false); }}>
                        <span className="item-icon">➕</span>
                        <span className="item-name">Add New Business</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessSwitcher;
