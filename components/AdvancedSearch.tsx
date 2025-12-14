
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { SearchCriteria } from '../services/mockApi';

interface AdvancedSearchProps {
    onSearch: (criteria: SearchCriteria) => void;
    loading?: boolean;
    className?: string;
    contextLabel?: string;
    layout?: 'vertical' | 'grid';
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
    onSearch, 
    loading = false, 
    className = '',
    contextLabel = 'Search',
    layout = 'grid'
}) => {
    const [term, setTerm] = useState('');
    const [amount, setAmount] = useState<number | null>(null);
    const [cardNumber, setCardNumber] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ term, amount, cardNumber });
    };

    const handleClear = () => {
        setTerm('');
        setAmount(null);
        setCardNumber('');
    };

    if (layout === 'vertical') {
        return (
            <form onSubmit={handleSubmit} className={`flex flex-column gap-3 ${className}`}>
                <div className="flex flex-column gap-2">
                    <label htmlFor="searchTerm" className="text-sm font-medium text-700">Case ID / Subject</label>
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText 
                            id="searchTerm"
                            placeholder="e.g. 100 or John Doe" 
                            value={term} 
                            onChange={(e) => setTerm(e.target.value)} 
                            className="w-full"
                        />
                    </span>
                </div>

                <div className="flex flex-column gap-2">
                    <label htmlFor="amount" className="text-sm font-medium text-700">Amount</label>
                    <InputNumber 
                        id="amount" 
                        value={amount} 
                        onValueChange={(e) => setAmount(e.value)} 
                        mode="currency" 
                        currency="USD" 
                        locale="en-US" 
                        placeholder="$0.00"
                        className="w-full"
                    />
                </div>

                <div className="flex flex-column gap-2">
                    <label htmlFor="cardNumber" className="text-sm font-medium text-700">Card Number (Last 4)</label>
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-credit-card" />
                        <InputText 
                            id="cardNumber"
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value)} 
                            placeholder="****"
                            maxLength={4}
                            keyfilter="int"
                            className="w-full"
                        />
                    </span>
                </div>

                <div className="flex gap-2 mt-2">
                    <Button 
                        label={contextLabel} 
                        icon="pi pi-search" 
                        loading={loading} 
                        type="submit" 
                        className="flex-1" 
                    />
                     <Button 
                        icon="pi pi-times" 
                        type="button" 
                        onClick={handleClear}
                        className="p-button-secondary p-button-outlined"
                        tooltip="Clear Filters"
                    />
                </div>
            </form>
        );
    }

    // Grid Layout (Horizontal)
    return (
        <form onSubmit={handleSubmit} className={`p-fluid grid formgrid align-items-end ${className}`}>
            <div className="field col-12 md:col-4">
                <label htmlFor="hSearchTerm" className="font-medium">Case ID / Subject</label>
                <div className="p-inputgroup">
                    <span className="p-inputgroup-addon"><i className="pi pi-search"></i></span>
                    <InputText 
                        id="hSearchTerm"
                        placeholder="Keywords..." 
                        value={term} 
                        onChange={(e) => setTerm(e.target.value)} 
                    />
                </div>
            </div>
            
            <div className="field col-12 md:col-3">
                <label htmlFor="hAmount" className="font-medium">Amount</label>
                <InputNumber 
                    id="hAmount" 
                    value={amount} 
                    onValueChange={(e) => setAmount(e.value)} 
                    mode="currency" 
                    currency="USD" 
                    locale="en-US" 
                />
            </div>

            <div className="field col-12 md:col-3">
                <label htmlFor="hCardNumber" className="font-medium">Card Number (Last 4)</label>
                <div className="p-inputgroup">
                    <span className="p-inputgroup-addon"><i className="pi pi-credit-card"></i></span>
                    <InputText 
                        id="hCardNumber"
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        placeholder="****"
                        maxLength={4}
                        keyfilter="int"
                    />
                </div>
            </div>

            <div className="field col-12 md:col-2 flex gap-2">
                <Button label="Search" icon="pi pi-search" loading={loading} type="submit" />
                <Button icon="pi pi-times" type="button" onClick={handleClear} className="p-button-secondary p-button-outlined w-4rem flex-shrink-0" />
            </div>
        </form>
    );
};
