import { useState, useContext } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
// import api from '../api/axios';
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import AuthContext from '../contexts/AuthContext';

const UploadPage = () => {
    const [uploadStatus, setUploadStatus] = useState({});
    const [loading, setLoading] = useState(false);

    const { selectedBusiness, user } = useContext(AuthContext);

    // Helper to clean keys
    const cleanKey = (key) => key.toString().trim().toLowerCase().replace(/[\s_]/g, '');

    // Helper to parse date
    const parseDate = (val) => {
        if (!val) return new Date();
        if (typeof val === 'number') {
            // Excel serial date
            return new Date(Math.round((val - 25569) * 86400 * 1000));
        }
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const handleUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!selectedBusiness) {
            alert("Please select a business first.");
            return;
        }

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (!data || data.length === 0) throw new Error("No data found");

                let records = [];

                if (type === 'sales') {
                    records = data.map(row => {
                        const keys = Object.keys(row);
                        const findVal = (k) => row[keys.find(key => cleanKey(key) === k)];

                        const date = findVal('date') || findVal('invoice_date') || new Date();
                        const amount = findVal('amount') || findVal('total') || 0;
                        const desc = findVal('description') || findVal('particulars') || 'Sales Entry';
                        const paymentType = findVal('paymenttype') || findVal('mode') || 'Cash';

                        return {
                            user_id: user.id,
                            business_id: selectedBusiness.id,
                            date: parseDate(date),
                            amount: Number(amount) || 0,
                            description: desc,
                            payment_type: paymentType
                        };
                    });
                } else if (type === 'expenses') {
                    records = data.map(row => {
                        const keys = Object.keys(row);
                        const findVal = (k) => row[keys.find(key => cleanKey(key) === k)];

                        return {
                            user_id: user.id,
                            business_id: selectedBusiness.id,
                            date: parseDate(findVal('date') || new Date()),
                            amount: Number(findVal('amount')) || 0,
                            category: findVal('category') || 'General',
                            description: findVal('description') || ''
                        };
                    });
                } else if (type === 'receivables') {
                    records = data.map(row => {
                        const keys = Object.keys(row);
                        const findVal = (k) => row[keys.find(key => cleanKey(key) === k)]; // simplified fuzzy match

                        return {
                            user_id: user.id,
                            business_id: selectedBusiness.id,
                            customer_name: findVal('customername') || findVal('customer') || findVal('name'),
                            amount_due: Number(findVal('amountdue') || findVal('amount') || 0),
                            invoice_date: parseDate(findVal('invoicedate') || findVal('date')),
                            expected_payment_date: parseDate(findVal('expectedpaymentdate') || findVal('duedate')),
                            status: findVal('status') || 'Pending'
                        };
                    });
                } else if (type === 'inventory') {
                    records = data.map(row => {
                        const keys = Object.keys(row);
                        const findVal = (k) => row[keys.find(key => cleanKey(key) === k)];

                        return {
                            user_id: user.id,
                            business_id: selectedBusiness.id,
                            item_name: findVal('itemname') || findVal('item') || 'Item',
                            quantity: Number(findVal('quantity') || findVal('qty') || 0),
                            unit_cost: Number(findVal('unitcost') || findVal('cost') || 0),
                            reorder_cost: Number(findVal('reordercost') || 0),
                            purchase_date: parseDate(findVal('purchasedate') || findVal('date'))
                        };
                    });
                }

                records = records.filter(r => (r.amount !== 0 && r.amount_due !== 0)); // Basic filter

                if (records.length > 0) {
                    const { error } = await supabase.from(type).insert(records);
                    if (error) throw error;
                    setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
                } else {
                    throw new Error("No valid records to upload");
                }

            } catch (error) {
                console.error("Upload failed", error);
                setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
            }
            setLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <Navbar />
            <div className="container" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Upload Financial Data</h2>
                        <p style={{ color: '#94a3b8' }}>
                            Upload your daily Excel/CSV exports to update the forecast.
                        </p>
                    </div>
                    <a href="/sample_data.xlsx" download className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                        <FileSpreadsheet size={16} style={{ marginRight: '0.5rem' }} /> Download Sample Template
                    </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <UploadCard
                        title="Sales Data"
                        desc="Daily sales from POS with payment types"
                        type="sales"
                        status={uploadStatus.sales}
                        onUpload={handleUpload}
                    />
                    <UploadCard
                        title="Expenses"
                        desc="Rent, salaries, and other operational costs"
                        type="expenses"
                        status={uploadStatus.expenses}
                        onUpload={handleUpload}
                    />
                    <UploadCard
                        title="Inventory"
                        desc="Stock items and reorder costs"
                        type="inventory"
                        status={uploadStatus.inventory}
                        onUpload={handleUpload}
                    />
                    <UploadCard
                        title="Receivables"
                        desc="Pending payments from customers"
                        type="receivables"
                        status={uploadStatus.receivables}
                        onUpload={handleUpload}
                    />
                </div>

                {loading && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', color: '#1a73e8' }}>
                        Processing files...
                    </div>
                )}
            </div>
        </div>
    );
};

const UploadCard = ({ title, desc, type, status, onUpload }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                padding: '0.75rem',
                background: '#e8f0fe',
                borderRadius: '0.5rem',
                color: '#1a73e8'
            }}>
                <FileSpreadsheet size={24} />
            </div>
            {status === 'success' && <CheckCircle size={20} color="#1e8e3e" />}
            {status === 'error' && <AlertCircle size={20} color="#d93025" />}
        </div>

        <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#202124' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#5f6368' }}>{desc}</p>
        </div>

        <label style={{ cursor: 'pointer', marginTop: 'auto' }}>
            <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => onUpload(e, type)}
                style={{ display: 'none' }}
            />
            <div style={{
                border: '1px dashed #dadce0',
                padding: '1rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                color: '#5f6368',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
            }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#1a73e8'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#dadce0'}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <UploadCloud size={16} /> Upload File
                </div>
            </div>
        </label>
    </div>
);

export default UploadPage;
