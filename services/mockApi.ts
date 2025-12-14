
export interface SearchCriteria {
    term?: string;
    amount?: number | null;
    cardNumber?: string;
}

export const mockFetchContent = async (id: string | number): Promise<{ base64: string; mimeType: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Determine type based on ID conventions (e.g., if ID contains 'pdf' or is divisible by 4)
    // This mocks the backend logic of retrieving the specific document type.
    const isPdf = String(id).includes('pdf') || (typeof id === 'number' && id % 4 === 0);

    if (isPdf) {
        // A minimal valid 1-page PDF base64 (Blank page with text)
        const dummyPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgRlbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSC4gIC9SZXNvdXJjZXMgPDwKICAgIC9Gb250IDw8CiAgICAgIC9GMSA0IDAgUgogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgRlbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCiAgPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKNzAgNTAgVGQKL0YxIDEyIFRmCihIZWxsbywgdGhpcyBpcyBhIFBERiBkb2N1bWVudC4pIFRqCkVUCmVuZHN0cmVhbQRlbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxNTcgMDAwMDAgbiAKMDAwMDAwMDI1NSAwMDAwMCBuIAowMDAwMDAwMzYyIDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ1OQolJUVPRgo=";
        return { base64: dummyPdfBase64, mimeType: 'application/pdf' };
    } else {
        try {
            // Fetch a random image for demo purposes
            const response = await fetch(`https://picsum.photos/800/600?random=${id}`);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // remove data prefix if present to simulate raw base64 response from API
                    const rawBase64 = base64data.split(',')[1]; 
                    resolve({ base64: rawBase64, mimeType: 'image/jpeg' });
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            // Fallback empty image
            return { base64: "", mimeType: 'image/jpeg' };
        }
    }
};

export const mockFetchMetadata = async (id: string | number): Promise<any[]> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     
     return [
        { property: 'ID', value: id },
        { property: 'Fetched At', value: new Date().toLocaleTimeString() },
        { property: 'Source', value: 'Secure Vault API' },
        { property: 'Encryption', value: 'AES-256' },
        { property: 'Owner', value: 'Department of Justice' },
        { property: 'Classification', value: 'Confidential' },
        { property: 'File Size', value: `${(Math.random() * 5 + 1).toFixed(2)} MB` }
     ];
};

// Mock Search for Active Cases
export const searchActiveCases = async (criteria: SearchCriteria): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate some random results that generally match or just return random stuff for the mock
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
