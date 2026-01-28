
export interface SearchCriteria {
    term?: string;
    amount?: number | null;
    cardNumber?: string;
}

export interface GalleryItem {
    id: string | number;
    thumbnail?: string;
    title: string;
    type: 'image' | 'pdf' | 'document';
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
    
    return [
        {
            id: 'sample-hq-1',
            title: 'Primary Forensic Capture',
            type: 'image',
            thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200&h=200&auto=format&fit=crop',
            description: 'Ultra-high resolution laboratory scan of biological sample 404.'
        },
        {
            id: 'sample-hq-2',
            title: 'Case Summary PDF',
            type: 'pdf',
            description: 'Encrypted document containing final verdict and evidence chain.'
        },
        ...Array.from({ length: 12 }, (_, i): GalleryItem => ({
            id: `asset-${documentId}-${i}`,
            title: `Asset ${100 + i}`,
            type: (i + 1) % 4 === 0 ? 'pdf' : 'image',
            thumbnail: (i + 1) % 4 === 0 ? undefined : `https://picsum.photos/200/200?random=${i + 500}`,
            description: 'Vault archive record'
        }))
    ];
};

export const mockFetchContent = async (id: string | number): Promise<{ base64: string; mimeType: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const idStr = String(id);
    // Identify PDF if ID contains 'pdf', is the specific HQ sample, or follows the generated asset index pattern
    const isAssetPdf = idStr.startsWith('asset-') && (parseInt(idStr.split('-').pop() || '0') + 1) % 4 === 0;
    const isPdf = idStr.includes('pdf') || idStr.includes('sample-hq-2') || isAssetPdf;

    if (isPdf) {
        // A minimal valid 1-page PDF base64 (Fixed: Removed invalid '.' character from previous version)
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
            assignee: ['Officer K.', 'Det. Miller', 'Agent Smith'][i % 3],
            priority: i % 2 === 0 ? 'High' : 'Medium',
            date: new Date().toLocaleDateString(),
            status: 'Active',
            amount: criteria.amount || Math.floor(Math.random() * 10000),
            cardNumber: criteria.cardNumber || `**** **** **** ${1000 + i}`
        };
    });
    return results;
};
