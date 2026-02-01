
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { TreeNode } from 'primereact/treenode';

// --- Types ---

export interface RawApiResponse {
    type: string;
    fileName?: string;
    fielname?: string; // Handling potential typo from spec
    contentList?: string[];
    contenList?: string[]; // Handling potential typo from spec
}

export interface DocumentContent {
    type: string;
    fileName: string;
    pages: string[]; // List of Base64 strings
}

export interface SearchNodeData {
    type: 'folder' | 'image' | 'document';
    src?: string;
    metadata: { property: string; value: string }[];
}

// --- Axios Configuration ---

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// --- Fetch Functions ---

/**
 * Fetches the rendered document content (images/pages).
 * Includes a mock fallback for demonstration purposes if the backend is unreachable.
 */
const fetchDocumentRender = async (documentId: string | number): Promise<DocumentContent> => {
    try {
        const { data } = await apiClient.get<RawApiResponse>(`/documents/${documentId}/render`);
        return normalizeDocumentResponse(data, documentId);
    } catch (error) {
        // --- FALLBACK MOCK DATA FOR DEMO ---
        // In a real production app, you would throw the error: throw error;
        console.warn(`[Mock Service] API failed for ID ${documentId}. Returning mock data.`);
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

        const mockRaw: RawApiResponse = {
            type: "png",
            fileName: `Secure_Scan_${documentId}.png`,
            contenList: [
                // 1. Grey Pattern
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=", 
                // 2. Blue Pattern
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                // 3. Red Pattern
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            ]
        };
        return normalizeDocumentResponse(mockRaw, documentId);
    }
};

/**
 * Fetches the Search Tree structure.
 * Consolidates the multi-source logic (Police, Forensics, Court) into one service call.
 */
const fetchSearchTree = async (term: string): Promise<TreeNode[]> => {
    try {
        const { data } = await apiClient.get<TreeNode[]>('/search/tree', { params: { q: term } });
        return data;
    } catch (error) {
        console.warn("[Mock Service] Search Tree API failed. Generating mock tree.");
        await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate complex query latency

        // Mock Logic moved from Component to Service
        const searchId = term || 'Global_Query';

        // 1. Police Data
        const policeData: TreeNode = {
            key: 'api1',
            label: 'Police Records (API 1)',
            expanded: true, // Expand first level by default
            data: { 
                type: 'folder', 
                metadata: [
                    { property: 'Source System', value: 'RMS-Pro' },
                    { property: 'Department', value: 'Metro Police' },
                    { property: 'Case Status', value: 'Active' }
                ] 
            } as SearchNodeData,
            icon: 'pi pi-fw pi-shield',
            children: [
                {
                    key: 'api1-doc1',
                    label: `Incident_Report_${searchId}.pdf`,
                    icon: 'pi pi-fw pi-file-pdf',
                    data: { 
                        type: 'document', 
                        metadata: [
                            { property: 'Author', value: 'Sgt. O\'Malley' },
                            { property: 'Date Filed', value: '2023-11-12' },
                            { property: 'Pages', value: '5' }
                        ] 
                    } as SearchNodeData
                },
                {
                    key: 'api1-folder1',
                    label: 'Witness Statements',
                    icon: 'pi pi-fw pi-folder',
                    data: { type: 'folder', metadata: [{ property: 'Count', value: '2' }] } as SearchNodeData,
                    children: [
                        {
                            key: 'api1-doc2',
                            label: 'Statement_Doe.txt',
                            icon: 'pi pi-fw pi-file',
                            data: { type: 'document', metadata: [{ property: 'Witness', value: 'John Doe' }] } as SearchNodeData
                        }
                    ]
                }
            ]
        };

        // 2. Forensics Data
        const forensicsData: TreeNode = {
            key: 'api2',
            label: 'Forensics Lab (API 2)',
            expanded: false, // Expand first level by default
            data: { 
                type: 'folder', 
                metadata: [
                    { property: 'Source System', value: 'LIMS-Cloud' },
                    { property: 'Lab ID', value: `LAB-${searchId}` }
                ] 
            } as SearchNodeData,
            icon: 'pi pi-fw pi-search',
            children: [
                {
                    key: 'api2-folder1',
                    label: 'Crime Scene Photos',
                    icon: 'pi pi-fw pi-images',
                    data: { type: 'folder', metadata: [{ property: 'Resolution', value: 'High' }] } as SearchNodeData,
                    // Nested folder is NOT expanded by default
                    children: [
                        { 
                            key: 'api2-img1', 
                            label: 'Scene_Overview.jpg', 
                            icon: 'pi pi-fw pi-image', 
                            data: { 
                                type: 'image', 
                                src: 'https://picsum.photos/800/600?random=101',
                                metadata: [
                                    { property: 'Filename', value: 'Scene_Overview.jpg' },
                                    { property: 'Dimensions', value: '4000x3000' },
                                    { property: 'ISO', value: '400' }
                                ]
                            } as SearchNodeData
                        },
                        { 
                            key: 'api2-img2', 
                            label: 'Evidence_Marker_1.jpg', 
                            icon: 'pi pi-fw pi-image', 
                            data: { 
                                type: 'image', 
                                src: 'https://picsum.photos/800/600?random=102',
                                metadata: [
                                    { property: 'Filename', value: 'Evidence_Marker_1.jpg' },
                                    { property: 'Dimensions', value: '4000x3000' },
                                    { property: 'Macro', value: 'Yes' }
                                ]
                            } as SearchNodeData
                        }
                    ]
                }
            ]
        };

        // 3. Court Data
        const courtData: TreeNode = {
            key: 'api3',
            label: 'Judiciary System (API 3)',
            expanded: true, // Expand first level by default
            data: { 
                type: 'folder', 
                metadata: [
                    { property: 'Source System', value: 'CourtConnect' },
                    { property: 'Jurisdiction', value: 'District 9' }
                ] 
            } as SearchNodeData,
            icon: 'pi pi-fw pi-building',
            children: [
                {
                    key: 'api3-doc1',
                    label: `Warrant_${searchId}_Signed.pdf`,
                    icon: 'pi pi-fw pi-file-pdf',
                    data: { 
                        type: 'document', 
                        metadata: [
                            { property: 'Judge', value: 'Hon. P. Denton' },
                            { property: 'Date Signed', value: '2023-11-10' }
                        ] 
                    } as SearchNodeData
                }
            ]
        };

        return [policeData, forensicsData, courtData];
    }
};

// --- Helpers ---

const normalizeDocumentResponse = (data: RawApiResponse, id: string | number): DocumentContent => {
    return {
        type: data.type || 'png',
        fileName: data.fileName || data.fielname || `Document_${id}`,
        pages: data.contentList || data.contenList || []
    };
};

// --- React Query Hooks ---

export const useDocumentContent = (documentId: string | number) => {
    return useQuery({
        queryKey: ['document', documentId],
        queryFn: () => fetchDocumentRender(documentId),
        enabled: !!documentId,
    });
};

export const useSearchTree = (term: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['searchTree', term],
        queryFn: () => fetchSearchTree(term),
        enabled: enabled,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });
};
