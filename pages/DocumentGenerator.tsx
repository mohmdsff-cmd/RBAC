import React, { useState } from 'react';
import { DynamicLetterForm } from '../components/DynamicLetterForm';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const sampleSurveyJson = {
    title: "Generate Customer Dispute Letter",
    description: "Fill out the fields below to generate a formal dispute response letter.",
    elements: [
        {
            type: "text",
            name: "customerName",
            title: "Customer Full Name",
            isRequired: true,
        },
        {
            type: "text",
            name: "accountNumber",
            title: "Account Number",
            isRequired: true,
            validators: [
                {
                    type: "regex",
                    regex: "^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$",
                    text: "Account number must be in XXXX-XXXX-XXXX-XXXX format"
                }
            ]
        },
        {
            type: "dropdown",
            name: "disputeType",
            title: "Dispute Type",
            isRequired: true,
            choices: [
                "Fraudulent Transaction",
                "Product Not Received",
                "Service Not Provided",
                "Double Charge",
                "Other"
            ]
        },
        {
            type: "text",
            name: "transactionAmount",
            title: "Transaction Amount ($)",
            inputType: "number",
            isRequired: true,
        },
        {
            type: "comment",
            name: "additionalDetails",
            title: "Additional Details (will be included in the letter)",
            rows: 4
        }
    ]
};

const DocumentGenerator: React.FC = () => {
    const toast = React.useRef<Toast>(null);

    const handleSubmit = (data: any) => {
        console.log("Form submitted with data:", data);
        toast.current?.show({ 
            severity: 'success', 
            summary: 'Document Generated', 
            detail: 'The letter has been formally generated and attached to the case.',
            life: 3000 
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-column gap-4">
            <Toast ref={toast} />
            <div className="flex align-items-center justify-content-between">
                <div>
                    <h1 className="text-2xl font-bold text-900 m-0 tracking-tight">Document Generator</h1>
                    <p className="text-500 m-0 mt-1">Use the dynamic form below to generate a standardized PDF document.</p>
                </div>
            </div>

            <Card className="shadow-none border-1 border-200">
                <DynamicLetterForm 
                    schema={sampleSurveyJson} 
                    onSubmit={handleSubmit} 
                />
            </Card>
        </div>
    );
};

export default DocumentGenerator;
