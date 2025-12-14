
import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ReportSortControl, SortDirection } from './ReportSortControl';

interface ReportGeneratorProps {
    apiUrl: string;
    range?: boolean;
    title: string;
    subTitle: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ apiUrl, range = false, title, subTitle }) => {
    // Single Date State
    const [date, setDate] = useState<Date | null>(null);
    
    // Range Date State
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Primary Sort State
    const [primarySort, setPrimarySort] = useState<string | null>(null);
    const [primaryDir, setPrimaryDir] = useState<SortDirection>('asc');

    // Secondary Sort State
    const [secondarySort, setSecondarySort] = useState<string | null>(null);
    const [secondaryDir, setSecondaryDir] = useState<SortDirection>('asc');

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
        // Validation
        if (range) {
             if (!startDate || !endDate) {
                toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select both start and end dates.', life: 3000 });
                return;
             }
             if (startDate > endDate) {
                toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Start date must be before end date.', life: 3000 });
                return;
             }
        } else {
            if (!date) {
                toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a report date.', life: 3000 });
                return;
            }
        }

        if (!primarySort) {
            toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a primary sort option.', life: 3000 });
            return;
        }

        setLoading(true);

        // Simulate API call using apiUrl
        console.log(`Generating report from: ${apiUrl}`);
        console.log(`Sort 1: ${primarySort} (${primaryDir})`);
        console.log(`Sort 2: ${secondarySort} (${secondaryDir})`);

        setTimeout(() => {
            setLoading(false);
            const detailText = range && startDate && endDate
                ? `Report for ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                : `Report for ${date?.toLocaleDateString()}`;
            
            toast.current?.show({ 
                severity: 'success', 
                summary: 'Report Generated', 
                detail: `${detailText} downloaded successfully.`, 
                life: 3000 
            });
        }, 2000);
    };

    return (
        <Card title={title} subTitle={subTitle} className="w-full md:w-6 shadow-3">
            <Toast ref={toast} />
            <div className="grid formgrid p-fluid mt-4">
                
                {/* Date Selection */}
                {range ? (
                    <>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="startDate" className="font-medium text-700">Start Date</label>
                            <span className="p-input-icon-right w-full">
                                <i className="pi pi-calendar" />
                                <Calendar 
                                    id="startDate" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.value as Date)} 
                                    showIcon 
                                    placeholder="Start Date" 
                                    className="w-full" 
                                    dateFormat="dd/mm/yy"
                                    maxDate={endDate || undefined}
                                />
                            </span>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="endDate" className="font-medium text-700">End Date</label>
                            <span className="p-input-icon-right w-full">
                                <i className="pi pi-calendar" />
                                <Calendar 
                                    id="endDate" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.value as Date)} 
                                    showIcon 
                                    placeholder="End Date" 
                                    className="w-full" 
                                    dateFormat="dd/mm/yy"
                                    minDate={startDate || undefined}
                                />
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="field col-12">
                        <label htmlFor="reportDate" className="font-medium text-700">Report Date</label>
                        <span className="p-input-icon-right w-full">
                            <i className="pi pi-calendar" />
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
                )}

                <div className="col-12 border-bottom-1 border-200 my-3"></div>

                {/* Primary Sort Row */}
                <div className="col-12">
                    <ReportSortControl
                        id="primarySort"
                        label="Primary Sort"
                        value={primarySort}
                        direction={primaryDir}
                        options={sortOptions}
                        onValueChange={setPrimarySort}
                        onDirectionChange={setPrimaryDir}
                    />
                </div>

                {/* Secondary Sort Row */}
                <div className="col-12">
                    <ReportSortControl
                        id="secondarySort"
                        label="Secondary Sort"
                        value={secondarySort}
                        direction={secondaryDir}
                        options={sortOptions}
                        onValueChange={setSecondarySort}
                        onDirectionChange={setSecondaryDir}
                        disabled={!primarySort}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-content-end align-items-center mt-5 pt-4 border-top-1 border-200">
                <Button 
                    label={loading ? "Processing..." : "Download Report"} 
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"} 
                    onClick={handleDownload} 
                    disabled={loading}
                    severity="help"
                />
            </div>
        </Card>
    );
};
