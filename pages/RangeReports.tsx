
import React from 'react';
import { ReportGenerator } from '../components/ReportGenerator';

const RangeReports: React.FC = () => {
    return (
        <div className="flex justify-content-center align-items-start pt-6 min-h-screen">
            <ReportGenerator 
                title="Period Report" 
                subTitle="Export aggregated data over a date range"
                apiUrl="/api/v1/reports/range"
                range={true}
            />
        </div>
    )
}
export default RangeReports;
