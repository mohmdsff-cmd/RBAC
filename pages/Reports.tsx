import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const Reports: React.FC = () => {
    const [date, setDate] = useState<Date | null>(null);
    const [primarySort, setPrimarySort] = useState<string | null>(null);
    const [secondarySort, setSecondarySort] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const sortOptions = [
        { label: 'Date Created', value: 'date_created' },
        { label: 'Transaction Amount', value: 'amount' },
        { label: 'Customer Name', value: 'customer_name' },
        { label: 'Region', value: 'region' },
        { label: 'Status', value: 'status' }
    ];

    const handleDownload = () => {
        if (!date) {
             toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a report date.', life: 3000 });
             return;
        }
        if (!primarySort) {
            toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a primary sort option.', life: 3000 });
            return;
       }

        setLoading(true);
        
        // Simulate API call and file generation
        setTimeout(() => {
            setLoading(false);
            toast.current?.show({ severity: 'success', summary: 'Report Generated', detail: 'Your report has been downloaded successfully.', life: 3000 });
        }, 2000);
    };

    return (
        <div className="flex justify-center items-start pt-10 min-h-[80vh]">
            <Toast ref={toast} />
            <Card title="Generate Daily Report" subTitle="Select parameters to export system data" className="w-full max-w-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    
                    {/* Date Selection */}
                    <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                        <label htmlFor="reportDate" className="font-medium text-slate-700">Report Date</label>
                        <span className="p-input-icon-right w-full">
                            <Calendar 
                                id="reportDate" 
                                value={date} 
                                onChange={(e) => setDate(e.value as Date)} 
                                showIcon 
                                placeholder="Select Date" 
                                className="w-full" 
                                dateFormat="dd/mm/yy"
                            />
                        </span>
                    </div>

                    <div className="col-span-1 md:col-span-2 border-b border-slate-100 my-2"></div>

                    {/* Primary Sort */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="primarySort" className="font-medium text-slate-700">Primary Sort Criteria</label>
                         <Dropdown 
                            id="primarySort" 
                            value={primarySort} 
                            onChange={(e) => setPrimarySort(e.value)} 
                            options={sortOptions} 
                            placeholder="Select Primary Sort" 
                            className="w-full" 
                            showClear
                         />
                    </div>

                    {/* Secondary Sort */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="secondarySort" className="font-medium text-slate-700">Secondary Sort Criteria</label>
                         <Dropdown 
                            id="secondarySort" 
                            value={secondarySort} 
                            onChange={(e) => setSecondarySort(e.value)} 
                            options={sortOptions} 
                            placeholder="Select Secondary Sort" 
                            className="w-full" 
                            showClear
                            disabled={!primarySort}
                         />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        Format: <span className="font-semibold text-slate-700">PDF, CSV</span>
                    </div>
                    <Button 
                        label={loading ? "Generating..." : "Download Report"} 
                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"} 
                        onClick={handleDownload} 
                        disabled={loading}
                    />
                </div>
            </Card>
        </div>
    )
}
export default Reports;