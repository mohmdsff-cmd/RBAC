
import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import FileSaver from 'file-saver';
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

    const handleDownload = async () => {
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

        try {
            // Construct Payload for Spring API
            const payload: any = {
                primarySort,
                primaryDir,
                secondarySort,
                secondaryDir,
                format: 'pdf', // defaulting to PDF, could be dynamic
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };

            if (range) {
                payload.startDate = startDate;
                payload.endDate = endDate;
            } else {
                payload.date = date;
            }

            console.log(`Requesting report from: ${apiUrl}`, payload);

            // Fetch request to Spring API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf, text/csv, application/vnd.ms-excel'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            // Process blob response
            const blob = await response.blob();
            
            // Extract filename from Content-Disposition header if available
            const disposition = response.headers.get('Content-Disposition');
            let filename = `Report_${range ? 'Period' : 'Daily'}_${new Date().getTime()}.pdf`;
            
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Trigger Download via FileSaver
            FileSaver.saveAs(blob, filename);

            toast.current?.show({ 
                severity: 'success', 
                summary: 'Download Complete', 
                detail: 'Report downloaded successfully.', 
                life: 3000 
            });

        } catch (error) {
            console.error("Report generation failed:", error);

            // --- FALLBACK FOR DEMO PURPOSES (Since API might not exist locally) ---
            console.warn("Generating Client-Side Mock Report due to API failure...");
            
            const mockContent = `DISPUTEHUB 360 REPORT\n` + 
                                `Title: ${title}\n` +
                                `Generated: ${new Date().toLocaleString()}\n` +
                                `Range: ${range ? `${startDate?.toLocaleDateString()} to ${endDate?.toLocaleDateString()}` : date?.toLocaleDateString()}\n` + 
                                `Sort By: ${primarySort} (${primaryDir})\n` +
                                `----------------------------------------\n` +
                                `ERROR: Could not connect to Spring API at ${apiUrl}.\n` +
                                `This is a generated mock file for demonstration.`;
            
            const mockBlob = new Blob([mockContent], { type: "text/plain;charset=utf-8" });
            FileSaver.saveAs(mockBlob, `${title.replace(/\s+/g, '_')}_MOCK.txt`);

            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Mock Report Generated', 
                detail: 'Backend unreachable. Downloaded client-side mock file.', 
                life: 5000 
            });
            // ---------------------------------------------------------------------

        } finally {
            setLoading(false);
        }
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
                    label={loading ? "Generating Report..." : "Download Report"} 
                    icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"} 
                    onClick={handleDownload} 
                    disabled={loading}
                    severity="help"
                />
            </div>
        </Card>
    );
};
