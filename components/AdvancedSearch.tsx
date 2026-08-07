import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { SearchCriteria } from '../services/mockApi';

interface AdvancedSearchProps {
    onSearch: (criteria: SearchCriteria) => void;
    loading?: boolean;
    className?: string;
    contextLabel?: string;
    layout?: 'vertical' | 'grid';
}

interface FieldProps {
    inputId: string;
    label: string;
    icon?: string;
    children: React.ReactNode;
}

// Reusable field wrapper for floating labels
const Field: React.FC<FieldProps> = ({ inputId, label, icon, children }) => (
    <span className={`p-float-label w-full ${icon ? 'p-input-icon-left' : ''}`}>
        {icon && <i className={`pi ${icon}`} />}
        {children}
        <label htmlFor={inputId}>{label}</label>
    </span>
);

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
    onSearch, 
    loading = false, 
    className = '',
    contextLabel = 'Search',
    layout = 'grid'
}) => {
    // 9 Fields State
    const [term, setTerm] = useState('');
    const [amount, setAmount] = useState<number | null>(null);
    const [cardNumber, setCardNumber] = useState('');
    const [merchant, setMerchant] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [reasonCode, setReasonCode] = useState<string | null>(null);
    const [agent, setAgent] = useState('');
    const [timeRange, setTimeRange] = useState<string | null>(null);
    const [priority, setPriority] = useState<string | null>(null);

    // Dropdown Options
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Pending Review', value: 'Pending' },
        { label: 'Closed', value: 'Closed' },
        { label: 'Escalated', value: 'Escalated' }
    ];

    const reasonOptions = [
        { label: '4837 - Fraud', value: '4837' },
        { label: '10.4 - Other Fraud', value: '10.4' },
        { label: '30 - Service Not Provided', value: '30' },
        { label: '83 - Missing Imprint', value: '83' }
    ];

    const timeRangeOptions = [
        { label: 'Last 24 Hours', value: '24h' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last Year', value: '1y' },
        { label: 'All Time', value: 'all' }
    ];

    const priorityOptions = [
        { label: 'High Priority', value: 'High' },
        { label: 'Medium Priority', value: 'Medium' },
        { label: 'Low Priority', value: 'Low' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ 
            term, amount, cardNumber, merchant, status, 
            reasonCode, agent, timeRange, priority
        });
    };

    const handleClear = () => {
        setTerm('');
        setAmount(null);
        setCardNumber('');
        setMerchant('');
        setStatus(null);
        setReasonCode(null);
        setAgent('');
        setTimeRange(null);
        setPriority(null);
    };

    const formContent = (
        <>
            {/* Field 1: Keywords */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-4'}>
                <Field inputId="term" label="Case ID / Keywords" icon="pi-search">
                    <InputText 
                        id="term"
                        value={term} 
                        onChange={(e) => setTerm(e.target.value)} 
                        className="w-full"
                    />
                </Field>
            </div>

            {/* Field 2: Merchant */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-4'}>
                <Field inputId="merchant" label="Merchant Name" icon="pi-building">
                    <InputText 
                        id="merchant"
                        value={merchant} 
                        onChange={(e) => setMerchant(e.target.value)} 
                        className="w-full"
                    />
                </Field>
            </div>

            {/* Field 3: Agent */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-4'}>
                <Field inputId="agent" label="Assigned Agent" icon="pi-user">
                    <InputText 
                        id="agent"
                        value={agent} 
                        onChange={(e) => setAgent(e.target.value)} 
                        className="w-full"
                    />
                </Field>
            </div>

            {/* Field 4: Status */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-3'}>
                <Field inputId="status" label="Case Status">
                    <Dropdown 
                        inputId="status"
                        value={status} 
                        options={statusOptions} 
                        onChange={(e) => setStatus(e.value)} 
                        className="w-full"
                        showClear
                    />
                </Field>
            </div>

            {/* Field 5: Reason */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-3'}>
                <Field inputId="reason" label="Dispute Reason">
                    <Dropdown 
                        inputId="reason"
                        value={reasonCode} 
                        options={reasonOptions} 
                        onChange={(e) => setReasonCode(e.value)} 
                        className="w-full"
                        showClear
                    />
                </Field>
            </div>

            {/* Field 6: Card Number */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-3'}>
                <Field inputId="card" label="Card Last 4" icon="pi-credit-card">
                    <InputText 
                        id="card"
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        maxLength={4}
                        keyfilter="int"
                        className="w-full"
                    />
                </Field>
            </div>

            {/* Field 7: Amount */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-3'}>
                <Field inputId="amount" label="Amount">
                    <InputNumber 
                        inputId="amount"
                        value={amount} 
                        onValueChange={(e) => setAmount(e.value)} 
                        mode="currency" 
                        currency="USD" 
                        locale="en-US" 
                        className="w-full"
                        inputClassName="w-full"
                    />
                </Field>
            </div>

            {/* Field 8: Time Range */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-6'}>
                <Field inputId="timeRange" label="Time Range">
                    <Dropdown 
                        inputId="timeRange"
                        value={timeRange} 
                        options={timeRangeOptions} 
                        onChange={(e) => setTimeRange(e.value)} 
                        className="w-full"
                        showClear
                    />
                </Field>
            </div>

            {/* Field 9: Priority */}
            <div className={layout === 'vertical' ? 'col-12' : 'col-12 md:col-6'}>
                <Field inputId="priority" label="Case Priority">
                    <Dropdown 
                        inputId="priority"
                        value={priority} 
                        options={priorityOptions} 
                        onChange={(e) => setPriority(e.value)} 
                        className="w-full"
                        showClear
                    />
                </Field>
            </div>
        </>
    );

    return (
        <form onSubmit={handleSubmit} className={`p-fluid ${className}`}>
             {/* 
                Using grid with gap-y-6 to give spacing for floating labels
             */}
            <div className="grid pt-2" style={{ rowGap: '1.5rem' }}>
                {formContent}

                <div className="col-12 mt-4 flex gap-3">
                    <Button 
                        label={contextLabel} 
                        icon="pi pi-search" 
                        loading={loading} 
                        type="submit" 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-none" 
                    />
                    <Button 
                        icon="pi pi-filter-slash" 
                        type="button" 
                        onClick={handleClear}
                        className="p-button-secondary p-button-outlined w-3rem flex-shrink-0 text-600 border-300 hover:surface-hover flex align-items-center justify-content-center p-0"
                        tooltip="Clear All Filters"
                    />
                </div>
            </div>
        </form>
    );
};
