

export interface SearchCriteria {
    term?: string;
    amount?: number | null;
    cardNumber?: string;
    merchant?: string;
    status?: string | null;
    reasonCode?: string | null;
    agent?: string;
    timeRange?: string | null;
    priority?: string | null;
}

export interface GalleryItem {
    id: string | number;
    thumbnail?: string;
    title: string;
    type: 'image' | 'pdf' | 'document' | 'png';
    description?: string;
}

export interface GalleryMetadataItem {
    property: string;
    value: any;
}

export interface CaseSummary {
    id: string;
    title: string;
    status: 'Open' | 'Closed' | 'Under Review';
    files: number;
    updated: string;
}

// --- NEW INTERFACES FOR DISPUTE ACCOUNT SEARCH ---

export interface AccountHistory {
    date: string;
    status: string;
    user: string;
    description: string;
}

export interface CaseNote {
    id: string;
    date: string;
    author: string;
    note: string;
}

export interface CaseDocument {
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
}

export interface DisputeAccount {
    accountId: string;
    disputeId: string;
    customerName: string;
    email: string;
    phone: string;
    currentStatus: string;
    riskScore: number;
    transactionAmount: number;
    merchant: string;
    history: AccountHistory[];
    notes: CaseNote[];
    documents: CaseDocument[];
}

// Mock Data for Base64 PNGs
const MOCK_PNG_RESPONSE_DATA = [
    // 1. Simple Grey/White Pattern
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABTSURBVGhD7c6xCQAgDETR5O6/sLqCiK3g8xTE8hXyEZfT3j33u/c+x8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8y8z8x83w0m1hW9X30v8AAAAABJRU5ErkJggg==",
    // 2. Simple Blue Pattern
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABVSURBVGhD7c4xDQAxEETR5h8yUECqgCoqYH8K4p5C/uJ62r3nfvfe55iZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ77sBmn4V/e0jK0UAAAAASUVORK5CYII=",
    // 3. Simple Red Pattern
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABVSURBVGhD7c6hDQAxEETR9h8yUECqgCoqYH8K4p5C/uJ62r3nfvfe55iZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ95mZ77sBnHQV/dD9WkAAAAAASUVORK5CYII="
];

export const mockFetchCases = async (): Promise<CaseSummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
        { id: 'CB-2023-8842', title: 'Chargeback Dispute - Electronics', status: 'Under Review', files: 14, updated: '2023-11-20' },
        { id: 'FR-2023-9921', title: 'Fraud Investigation - Retail', status: 'Open', files: 8, updated: '2023-11-19' },
        { id: 'AR-2023-1002', title: 'Arbitration Case - Services', status: 'Open', files: 22, updated: '2023-11-18' },
        { id: 'CB-2023-8810', title: 'Refund Claim - Digital Goods', status: 'Closed', files: 5, updated: '2023-11-10' },
        { id: 'KYC-2023-4421', title: 'Merchant KYC Verification', status: 'Under Review', files: 12, updated: '2023-11-05' },
    ];
};

export const mockFetchGalleryItems = async (documentId: string | number): Promise<GalleryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simulate API Response: { type: 'png', data: [...] }
    const apiResponse = {
        type: 'png',
        data: MOCK_PNG_RESPONSE_DATA
    };
    
    // Map response to application model
    return apiResponse.data.map((base64Str, index) => ({
        id: `api-png-${documentId}-${index}`,
        title: `Evidence Capture ${index + 1}`,
        type: 'png',
        thumbnail: `data:image/png;base64,${base64Str}`,
        description: 'Direct Base64 Stream Source'
    }));
};

export const mockFetchContent = async (id: string | number): Promise<{ base64: string; mimeType: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const idStr = String(id);

    // --- HANDLE NEW PNG API DATA ---
    if (idStr.startsWith('api-png-')) {
        // Extract index from ID "api-png-DOCID-INDEX"
        const parts = idStr.split('-');
        const index = parseInt(parts[parts.length - 1] || '0');
        const safeIndex = index % MOCK_PNG_RESPONSE_DATA.length;
        
        return {
            base64: MOCK_PNG_RESPONSE_DATA[safeIndex],
            mimeType: 'image/png'
        };
    }

    // --- EXISTING PDF / GENERIC LOGIC ---
    // Identify PDF if ID contains 'pdf', is the specific HQ sample, or follows the generated asset index pattern
    const isAssetPdf = idStr.startsWith('asset-') && (parseInt(idStr.split('-').pop() || '0') + 1) % 4 === 0;
    const isPdf = idStr.includes('pdf') || idStr.includes('sample-hq-2') || isAssetPdf;

    if (isPdf) {
        // A minimal valid 1-page PDF base64
        const dummyPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgRlbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCiAgICA+PgogID4+CiAgL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iagoKNCAwIG9iago8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgRlbmRvYmoKCjUgMCBvYmoKICA8PCAvTGVuZ3RoIDQ0ID4+CnN0cmVhbQpCVAo3MCA1MCBUZAovRjEgMTIgVGYKKEhlbGxvLCB0aGlzIGlzIGEgUERGIGRvY3VtZW50LikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNjIgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDU5CiUlRU9GCg==";
        return { base64: dummyPdfBase64, mimeType: 'application/pdf' };
    } else {
        try {
            const response = await fetch(`https://picsum.photos/800/600?random=${id}`);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // Some browsers might not return the prefix in all contexts, but FileReader usually does.
                    // Split safely.
                    const rawBase64 = base64data.includes(',') ? base64data.split(',')[1] : base64data; 
                    resolve({ base64: rawBase64, mimeType: 'image/jpeg' });
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return { base64: "", mimeType: 'image/jpeg' };
        }
    }
};

// Updated return type to Promise<GalleryMetadataItem[]>
export const mockFetchMetadata = async (id: string | number): Promise<GalleryMetadataItem[]> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     
     return [
        { property: 'ID', value: id },
        { property: 'Fetched At', value: new Date().toLocaleTimeString() },
        { property: 'Source', value: 'Secure Vault API' },
        { property: 'Encryption', value: 'AES-256' },
        { property: 'Classification', value: 'Confidential' },
        { property: 'File Size', value: `${(Math.random() * 5 + 1).toFixed(2)} MB` }
     ];
};

export const searchActiveCases = async (criteria: SearchCriteria): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const results = Array.from({ length: 5 }, (_, i) => {
        const idBase = criteria.term ? criteria.term.replace(/\D/g, '') : '999';
        return {
            id: `CS-${idBase}-${i}`,
            subject: `Investigation relating to ${criteria.term || 'Unknown'}`,
            assignee: criteria.agent || ['Officer K.', 'Det. Miller', 'Agent Smith'][i % 3],
            priority: criteria.priority || (i % 2 === 0 ? 'High' : 'Medium'),
            date: new Date().toLocaleDateString(),
            status: criteria.status || 'Active',
            amount: criteria.amount || Math.floor(Math.random() * 10000),
            cardNumber: criteria.cardNumber || `**** **** **** ${1000 + i}`
        };
    });
    return results;
};

// --- MOCK FUNCTION FOR DISPUTE ACCOUNT SEARCH ---
export const searchDisputeAccount = async (query: string): Promise<DisputeAccount | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!query || query.trim().length < 2) return null;
    
    // Simulate finding data
    return {
        accountId: query.toUpperCase().startsWith('ACC') ? query.toUpperCase() : `ACC-${query.toUpperCase()}`,
        disputeId: `DSP-${Math.floor(Math.random() * 100000)}`,
        customerName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 987-6543',
        currentStatus: 'Under Review',
        riskScore: 82,
        transactionAmount: 450.25,
        merchant: 'Global Electronics Ltd',
        history: [
            { date: '2023-10-07 10:15', status: 'Under Review', user: 'Sarah J.', description: 'Evidence received, review started' },
            { date: '2023-10-06 14:20', status: 'Pending Info', user: 'System', description: 'Waiting for customer evidence' },
            { date: '2023-10-05 09:00', status: 'New', user: 'System', description: 'Dispute created via API' }
        ],
        notes: [
            { id: '1', date: '2023-10-07 10:20', author: 'Sarah J.', note: 'Customer provided clear proof of delivery failure. Contacting merchant.' },
            { id: '2', date: '2023-10-08 09:00', author: 'System', note: 'Merchant notification email sent.' }
        ],
        documents: [
            { id: 'd1', name: 'proof_of_delivery.pdf', type: 'Evidence', date: '2023-10-07', size: '2.4 MB' },
            { id: 'd2', name: 'invoice_copy.jpg', type: 'Receipt', date: '2023-10-05', size: '1.1 MB' }
        ]
    };
};
