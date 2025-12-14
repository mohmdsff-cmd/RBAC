
import React from 'react';
import { Dropdown } from 'primereact/dropdown';

export type SortDirection = 'asc' | 'desc';

interface SortOption {
    label: string;
    value: string;
}

interface ReportSortControlProps {
    id: string;
    label: string;
    value: string | null;
    direction: SortDirection;
    options: SortOption[];
    onValueChange: (value: string) => void;
    onDirectionChange: (direction: SortDirection) => void;
    disabled?: boolean;
    className?: string;
}

export const ReportSortControl: React.FC<ReportSortControlProps> = ({
    id, label, value, direction, options, onValueChange, onDirectionChange, disabled, className
}) => {
    const directionOptions = [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' }
    ];

    return (
        <div className={`field ${className || ''}`}>
            <label htmlFor={id} className="font-medium text-700 block mb-2">{label}</label>
            <div className="flex gap-2">
                <Dropdown
                    id={id}
                    value={value}
                    options={options}
                    onChange={(e) => onValueChange(e.value)}
                    placeholder="Select Field"
                    className="flex-1"
                    disabled={disabled}
                />
                 <Dropdown
                    value={direction}
                    options={directionOptions}
                    onChange={(e) => e.value && onDirectionChange(e.value)}
                    disabled={disabled || !value}
                    className="w-10rem"
                    placeholder="Order"
                />
            </div>
        </div>
    );
};
