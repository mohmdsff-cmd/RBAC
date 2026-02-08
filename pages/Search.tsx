
import React, { useState } from 'react';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { SearchCriteria } from '../services/mockApi';
import { SearchResults } from '../components/SearchResults';

const Search: React.FC = () => {
  const [activeCriteria, setActiveCriteria] = useState<SearchCriteria | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (criteria: SearchCriteria) => {
    // Basic validation
    if (!Object.values(criteria).some(val => val !== null && val !== '')) return;
    
    setLoading(true);
    // Setting criteria triggers the search state
    setActiveCriteria(criteria);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className={`flex h-full gap-3 ${!searched ? 'justify-content-center align-items-center' : ''}`} style={{ height: 'calc(100vh - 8rem)' }}>
        
        {/* Left Sidebar / Main Search Container */}
        <div className={`
            flex flex-column surface-card border-round-xl shadow-1 border-1 border-200 overflow-hidden transition-all duration-500 ease-in-out
            ${!searched ? 'w-full max-w-5xl h-auto shadow-4' : 'w-20rem h-full flex-shrink-0'}
        `}>
            <div className={`
                border-bottom-1 border-200 bg-surface-50
                ${!searched ? 'p-4' : 'p-3'}
            `}>
                <span className={`font-bold text-900 flex align-items-center ${!searched ? 'text-2xl' : 'text-lg'}`}>
                    <i className={`pi pi-filter mr-2 text-primary ${!searched ? 'text-2xl' : ''}`}></i>
                    {searched ? 'Query Builder' : 'Global Data Search'}
                </span>
                 {!searched && (
                    <p className="text-600 m-0 mt-2 line-height-3">
                        Use the query builder to search across Police Records, Forensics Lab data, and Judiciary Systems simultaneously.
                    </p>
                )}
            </div>
            <div className={`
                overflow-y-auto custom-scrollbar flex-1
                ${!searched ? 'p-4' : 'p-3'}
            `}>
                <AdvancedSearch 
                    onSearch={handleSearch} 
                    loading={loading} 
                    layout={!searched ? 'grid' : 'vertical'}
                    contextLabel="Search Records"
                    className=""
                />
            </div>
        </div>

        {/* Right Content Area - Results (Only visible when searched) */}
        {searched && (
        <div className="flex-1 h-full min-w-0 flex flex-column fadein animation-duration-500">
             <SearchResults 
                docCaseId={activeCriteria?.term}
                accountNumber={activeCriteria?.cardNumber}
                status={activeCriteria?.status}
                priority={activeCriteria?.priority}
                onReset={() => { setSearched(false); setActiveCriteria(null); }}
             />
        </div>
        )}
    </div>
  );
};

export default Search;
