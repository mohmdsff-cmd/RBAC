import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { useNavigate } from 'react-router-dom';

interface CaseItem {
  accountNumber: string;
  caseId: string;
  arn: string;
  workcaseId: string;
  status: 'Under Review' | 'Open' | 'Pending Action' | 'Closed';
}

interface GeneratedDoc {
  id: string;
  type: 'Letter' | 'Email' | 'Notice';
  templateName: string;
  caseId: string;
  accountNumber: string;
  arn: string;
  timestamp: string;
  additionalComments?: string;
}

export const CaseManagementDashboard: React.FC = () => {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  // --- Initial High-Density Mock Case Stream ---
  const [cases, setCases] = useState<CaseItem[]>([
    {
      accountNumber: "4532-0192-3849-1102",
      caseId: "CS-99201",
      arn: "05432109876543210987654",
      workcaseId: "WK-8821",
      status: "Under Review"
    },
    {
      accountNumber: "4532-8829-1032-4491",
      caseId: "CS-44129",
      arn: "09123849182374981273948",
      workcaseId: "WK-4402",
      status: "Open"
    },
    {
      accountNumber: "3782-9910-3847-8821",
      caseId: "CS-88192",
      arn: "12345678901234567890123",
      workcaseId: "WK-9920",
      status: "Pending Action"
    },
    {
      accountNumber: "5102-3921-9921-3841",
      caseId: "CS-33821",
      arn: "98765432109876543210987",
      workcaseId: "WK-1283",
      status: "Closed"
    },
    {
      accountNumber: "4532-7711-3921-9210",
      caseId: "CS-77121",
      arn: "11122233344455566677788",
      workcaseId: "WK-3392",
      status: "Under Review"
    }
  ]);

  // --- Selection and Filter State ---
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(cases[0]);
  const [filterAccount, setFilterAccount] = useState('');
  const [filterCase, setFilterCase] = useState('');
  const [filterArn, setFilterArn] = useState('');

  // --- Action Hub & Dropdown Trigger state ---
  const [actionQuery, setActionQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Forms' | 'Letters' | 'Cover Letters'>('Forms');
  const actionInputRef = useRef<HTMLInputElement>(null);

  // --- Modal Generator States ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDocType, setModalDocType] = useState<'Form' | 'Letter' | 'Cover Letter'>('Form');
  const [selectedTemplate, setSelectedTemplate] = useState('Chargeback Claim Intake Form (C-102)');
  
  // Modal Fields (either injected or manual)
  const [injectedAcct, setInjectedAcct] = useState('');
  const [injectedCase, setInjectedCase] = useState('');
  const [injectedArn, setInjectedArn] = useState('');
  
  // Custom Overrides / Appending comments
  const [overrideComments, setOverrideComments] = useState('');
  const [generating, setGenerating] = useState(false);

  // --- Decrypt Latency Emulation state ---
  const [decryptingCaseId, setDecryptingCaseId] = useState<string | null>(null);
  const [revealedAccts, setRevealedAccts] = useState<Record<string, boolean>>({});

  // --- Generation History Stream ---
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([
    {
      id: "DOC-9921",
      type: "Letter",
      templateName: "Cardholder Dispute Acceptance",
      caseId: "CS-99201",
      accountNumber: "4532-0192-XXXX-1102",
      arn: "05432109876543210987654",
      timestamp: "2026-07-08 14:32:10",
      additionalComments: "Standard accept notice dispatch"
    }
  ]);

  // Detect query changes for Action Hub to reveal menu and swap active category
  useEffect(() => {
    const q = actionQuery.toUpperCase();
    if (q === 'LET' || q === 'LETTER' || q === 'LETTERS') {
      setActionMenuOpen(true);
      setActiveCategory('Letters');
    } else if (q === 'FOR' || q === 'FORM' || q === 'FORMS') {
      setActionMenuOpen(true);
      setActiveCategory('Forms');
    } else if (q === 'COV' || q === 'COVER' || q === 'COVERS') {
      setActionMenuOpen(true);
      setActiveCategory('Cover Letters');
    } else if (q === 'GEN' || q === 'DOC') {
      setActionMenuOpen(true);
    } else if (q === '') {
      setActionMenuOpen(false);
    }
  }, [actionQuery]);

  // Handle global keyboard listeners for dialog Esc & focus actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If dialog is open and user presses Esc, close dialogue cleanly
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
        toast.current?.show({
          severity: 'info',
          summary: 'Dialogue Escaped',
          detail: 'Generator closed cleanly without altering entered filter metrics.',
          life: 2500
        });
        // Refocus action hub
        actionInputRef.current?.focus();
      }

      // If action hub is focused, intercept F, L, C hotkeys
      if (document.activeElement === actionInputRef.current) {
        const key = e.key.toUpperCase();
        if (key === 'F') {
          e.preventDefault();
          launchGenerator('Form', 'Chargeback Claim Intake Form (C-102)');
        } else if (key === 'L') {
          e.preventDefault();
          launchGenerator('Letter', 'Cardholder Dispute Acceptance');
        } else if (key === 'C') {
          e.preventDefault();
          launchGenerator('Cover Letter', 'Arbitration Exhibit Briefing Cover');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, selectedCase]);

  // Trigger modal launch
  const launchGenerator = (type: 'Form' | 'Letter' | 'Cover Letter', templateName: string) => {
    setModalDocType(type);
    setSelectedTemplate(templateName);

    if (selectedCase) {
      // Auto inject values
      setInjectedAcct(maskAccountNumber(selectedCase.accountNumber));
      setInjectedCase(selectedCase.caseId);
      setInjectedArn(selectedCase.arn);
    } else {
      // Fallback: leave empty to convert to manual input text boxes
      setInjectedAcct('');
      setInjectedCase('');
      setInjectedArn('');
    }

    setOverrideComments('');
    setModalOpen(true);
    setActionMenuOpen(false);
  };

  // PCI-DSS Masking helper
  const maskAccountNumber = (acct: string) => {
    if (!acct) return '';
    const clean = acct.replace(/-/g, '');
    if (clean.length < 8) return acct;
    // Keep first 4 and last 4, middle masked
    return `${acct.substring(0, 4)}-${acct.substring(5, 9)}-XXXX-${acct.substring(acct.length - 4)}`;
  };

  // Real-time ARN validation
  const getArnValidation = (arnStr: string) => {
    const clean = arnStr.replace(/\D/g, '');
    if (clean.length === 0) return { status: 'empty', message: 'No ARN supplied' };
    if (clean.length === 23) return { status: 'valid', message: 'Valid 23-digit ARN format' };
    if (clean.length < 23) return { status: 'partial', message: `Incomplete (${clean.length}/23 digits)` };
    return { status: 'invalid', message: `Exceeded length (${clean.length}/23 digits)` };
  };

  // Safe manual decryption loading emulator
  const handleRevealAccount = (caseId: string) => {
    if (decryptingCaseId) return;
    setDecryptingCaseId(caseId);
    setTimeout(() => {
      setRevealedAccts(prev => ({ ...prev, [caseId]: true }));
      setDecryptingCaseId(null);
      toast.current?.show({
        severity: 'success',
        summary: 'Audit Decrypted',
        detail: 'Temporary direct account view logged in back-office audit registry.',
        life: 2000
      });
    }, 900);
  };

  // Generate Document Action handler
  const handleGenerateCorrespondence = () => {
    // Validate fields if manual
    if (!injectedAcct || !injectedCase || !injectedArn) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Breach',
        detail: 'Please provide all core metadata variables before official compilation.',
        life: 3000
      });
      return;
    }

    if (injectedArn.replace(/\D/g, '').length !== 23) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Compliance Warning',
        detail: 'Acquirer Reference Number (ARN) must be exactly 23 digits to comply with dispute protocols.',
        life: 3000
      });
    }

    setGenerating(true);

    setTimeout(() => {
      const newDoc: GeneratedDoc = {
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: modalDocType,
        templateName: selectedTemplate,
        caseId: injectedCase,
        accountNumber: injectedAcct,
        arn: injectedArn,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        additionalComments: overrideComments || undefined
      };

      setGeneratedDocs(prev => [newDoc, ...prev]);
      setGenerating(false);
      setModalOpen(false);

      toast.current?.show({
        severity: 'success',
        summary: 'Official Document Created',
        detail: `${modalDocType} compiled successfully and dispatched to queue.`,
        life: 4000
      });
    }, 1200);
  };

  // Filter cases based on ribbon criteria
  const filteredCases = cases.filter(c => {
    const matchesAcct = c.accountNumber.toLowerCase().includes(filterAccount.toLowerCase());
    const matchesCase = c.caseId.toLowerCase().includes(filterCase.toLowerCase());
    const matchesArn = c.arn.toLowerCase().includes(filterArn.toLowerCase());
    return matchesAcct && matchesCase && matchesArn;
  });

  // Dynamic preview text compilation
  const getCompiledPreview = () => {
    const acctSuffix = injectedAcct ? injectedAcct.substring(injectedAcct.length - 4) : 'XXXX';
    const caseRef = injectedCase || '[CASE-ID]';
    const arnRef = injectedArn || '[ARN-NUMBER]';

    // --- Forms Templates ---
    if (selectedTemplate === 'Chargeback Claim Intake Form (C-102)') {
      return `CHARGEBACK REGULATORY INTAKE RECORD
FORM ID: C-102 | SECURITIES RESOLUTION PROTOCOL

CASE ID REFERENCE : ${caseRef}
ACQUIRER REF NO   : ${arnRef}
ACCOUNT NUMBER    : ${injectedAcct || '[CARD-PAN]'}
TIMESTAMP LOGGED  : ${new Date().toISOString().substring(0, 10)}

1. DISPUTE DESCRIPTION:
The cardholder reports unauthorized debit or incorrect clearance of settlement funds at merchant point-of-sale.
2. REGULATORY ACTION REQUIRED:
Initiate formal chargeback routing through VISA/Mastercard central clearing engine.

${overrideComments ? `Intake Rider Comments: ${overrideComments}` : 'No further administrative annotations attached.'}

Form certified by Dispute Operations Unit.`;
    }
    
    if (selectedTemplate === 'Merchant Retrieval Submission (M-441)') {
      return `MERCHANT RETRIEVAL SUBMISSION PORTFOLIO
FORM ID: M-441 | CLEARING INQUIRY REGISTER

CASE REFERENCE    : ${caseRef}
ACQUIRER REF NO   : ${arnRef}
CARD PAN DIGITS   : ${injectedAcct || '[CARD-PAN]'}

In compliance with Card Brand retrieval guidelines, we demand high-density logs of:
- Full transaction receipt signature matching
- Point of sale terminal telemetry
- Signed invoice or delivery dispatch slips

${overrideComments ? `Special Instructions: ${overrideComments}` : 'Standard retrieval turnaround timeline applies (10 days).'}

Submitted to Central Acquirer Registry.`;
    }

    if (selectedTemplate === 'Pre-Arbitration Declaration (P-990)') {
      return `PRE-ARBITRATION FORMAL DECLARATION
FORM ID: P-990 | LITIGATION ESCALATION BRIEF

COMPLIANCE CASE   : ${caseRef}
ARN IDENTIFIER    : ${arnRef}
CARDHOLDER PAN    : ${injectedAcct || '[CARD-PAN]'}

The undersigned dispute compliance auditor declares that merchant-provided evidence is legally insufficient to counter original chargeback claims. Under Global Regulations Chapter 14, Section 3, case files are escalated to official Pre-Arbitration.

${overrideComments ? `Legal Counsel Note: ${overrideComments}` : 'Case moves to active network arbitration panel.'}`;
    }

    if (selectedTemplate === 'Financial Adjustment Authorization (F-338)') {
      return `FINANCIAL ADJUSTMENT AUTHORIZATION
FORM ID: F-338 | COMPLIANCE LEDGER SIGN-OFF

CREDIT REFERENCE  : ${caseRef}
ACQUIRER REF NO   : ${arnRef}
ACCOUNT PAN       : ${injectedAcct || '[CARD-PAN]'}

Authorized for immediate statement adjustment:
[X] Immediate provisional credit release
[X] Permanent general ledger dispute write-off
[X] Interchange adjustment entry

${overrideComments ? `Authorized Ledger Override: ${overrideComments}` : 'Standard provisional adjustments finalized.'}

Authorized by: Corporate Audit Division`;
    }

    // --- Letters Templates ---
    if (selectedTemplate === 'Cardholder Dispute Acceptance') {
      return `Dear Valued Cardholder,

This letter serves as formal notification regarding case reference ${caseRef} tied to account ending in ${acctSuffix}. The associated Acquirer Reference Number (ARN) has been thoroughly registered in our core compliance ledger as ${arnRef}.

We have validated the disputed transaction details and confirm that a chargeback claim has been formally initiated. Credit adjustments will reflect on your statement pending merchant arbitration window cycles.

${overrideComments ? `Adjustment Rider: ${overrideComments}` : 'No further administrative actions are required from your side at this juncture.'}

Sincerely,
Chargeback Resolution Division
DisputeHub 360 Enterprise`;
    }

    if (selectedTemplate === 'Retrieval Request Notification') {
      return `Subject: URGENT: Documentation Retrieval Request - Case ID ${caseRef}

Attention: Merchant Representation / Acquirer Services,

Please compile and submit complete transaction receipts and signature validation logs tied to Acquirer Reference Number (ARN) ${arnRef} and card profile ending in ${acctSuffix}.

Response is required within 10 business days to avoid unilateral dispute resolution in favor of the cardholder profile under standard card network rules.

${overrideComments ? `Operational Note: ${overrideComments}` : ''}

Thank you,
Dispute Operations & Compliance`;
    }

    if (selectedTemplate === 'Merchant Settlement Agreement') {
      return `MERCHANT DISPUTE SETTLEMENT AGREEMENT
OFFICIAL SETTLEMENT OFFER AND MUTUAL RELEASE

CASE ID REFERENCE : ${caseRef}
ARN COMPLIANCE ID : ${arnRef}
CARD PAN DIGITS   : ${injectedAcct || '[CARD-PAN]'}

This agreement resolves outstanding dispute funds between Cardholder and Merchant. By accepting these terms, Merchant agrees to refund 100% of disputed clearing fees, and the issuing bank agrees to cancel outstanding network arbitration filings.

${overrideComments ? `Settlement Riders: ${overrideComments}` : 'Settlement applies to all standard chargeback dispute elements.'}

Signed on behalf of Audit & Resolution Services.`;
    }

    if (selectedTemplate === 'Arbitrary Compliance Warning') {
      return `NOTICE OF ARBITRARY DISPUTE REVIEW & COMPLIANCE STATUTES

Case ID Reference: ${caseRef}
Acquirer Reference: ${arnRef}
Designated Card profile: ${injectedAcct || '[CARD-PAN]'}

This document outlines statutory review boundaries and arbitrary card brand guidelines applied to this claim folder. Under Section 14.3.a of global compliance statutes, both clearing networks and issuing institutions acknowledge validation of credentials.

${overrideComments ? `Statutory Adjustments: ${overrideComments}` : 'No secondary riders attached to this instrument.'}

Issued on behalf of Auditing Authority,
DisputeHub 360 Compliance Office`;
    }

    // --- Cover Letters Templates ---
    if (selectedTemplate === 'Arbitration Exhibit Briefing Cover') {
      return `ARBITRATION EXHIBIT BRIEFING COVER SHEET
DISPUTEHUB 360 COMPLIANCE TRANSMITTAL

TO: Card Brand Arbitration panel
CASE NUMBER REFERENCE: ${caseRef}
ACQUIRER REFERENCE NO: ${arnRef}
ACCOUNT PAN MASKED   : ${injectedAcct || '[CARD-PAN]'}

Enclosed please find Exhibit Portfolio A through G, consisting of customer affidavits, merchant point-of-sale logs, and chargeback dispute flow receipts.

${overrideComments ? `Exhibit Focus Notes: ${overrideComments}` : 'All materials comply with network dispute timeline constraints.'}

Prepared by: Lead Compliance Counsel`;
    }

    if (selectedTemplate === 'Compliance Package Transmittal Cover') {
      return `COMPLIANCE PACKAGE TRANSMITTAL INDEX
HIGH-DENSITY COMPLIANCE SYSTEM PORTFOLIO

CASE ID REF   : ${caseRef}
ARN LEDGER ID : ${arnRef}
ACCOUNT PAN   : ${injectedAcct || '[CARD-PAN]'}
INDEX STATUS  : [VERIFIED SYSTEM BUNDLE]

This document indexes the comprehensive compliance folder compiled for back-office archival review:
- Section 1: Customer Fraud Affidavit & Log
- Section 2: Electronic Signature Validation Certificate
- Section 3: ARN Ledger Match Verification

${overrideComments ? `Bundle Comments: ${overrideComments}` : 'No secondary components attached.'}

Archived under Federal Bank Security Standards.`;
    }

    if (selectedTemplate === 'Cardholder Appeal Documentation Cover') {
      return `CARDHOLDER COMPLIANCE APPEAL TRANSMITTAL
FORMAL CLAIM CHANNELS RE-OPENING BRIEF

CASE REFERENCE: ${caseRef}
ARN REFERENCE : ${arnRef}
ACCOUNT PAN   : ${injectedAcct || '[CARD-PAN]'}

This cover sheet transmits cardholder appeals, customer rebuttals, and additional support documentation disputing previous merchant favorable settlement outcomes.

${overrideComments ? `Appeal Rider Notes: ${overrideComments}` : 'Sourced from verified secure portal uploads.'}

Dispute Resolution Board, Compliance Div.`;
    }

    if (selectedTemplate === 'Legal Counsel Document Package Cover') {
      return `CONFIDENTIAL LEGAL COUNSEL DOCUMENT DISCLOSURE
PRIVILEGED WORK PRODUCT | DISPUTEHUB 360

CASE ID       : ${caseRef}
ARN TRACKING  : ${arnRef}
ACCOUNT PAN   : ${injectedAcct || '[CARD-PAN]'}

PRIVILEGED AND CONFIDENTIAL ATTORNEY-CLIENT DISCLOSURE
For review by inside corporate counsel and merchant representation panels. This folder houses dispute risk models and audit findings.

${overrideComments ? `Legal Counsel Directives: ${overrideComments}` : 'Do not distribute outside secure digital vault.'}

Prepared by: Compliance Audit Legal Group`;
    }

    return `SELECT A COMPLIANCE TEMPLATE TO PREVIEW`;
  };

  // Helper to render Action Hub Category Dropdown Submenus
  const renderActionHubMenu = () => {
    return (
      <div 
        className="absolute right-0 top-100 mt-2 bg-white border-1 border-300 border-round-lg shadow-4 z-5 overflow-hidden flex flex-row"
        style={{ width: '480px', height: '290px' }}
      >
        {/* Left Category tabs sidebar */}
        <div className="w-4 flex flex-column bg-slate-50 border-right-1 border-200">
          <div className="p-2 text-[10px] font-mono font-bold text-500 uppercase tracking-wider border-bottom-1 border-100 bg-slate-100">
            CATEGORIES
          </div>
          <div 
            className={`p-3 flex align-items-center gap-2 cursor-pointer text-xs font-bold transition-all ${
              activeCategory === 'Forms' ? 'bg-indigo-50 text-indigo-950 border-left-3 border-indigo-600' : 'text-700 hover:bg-slate-100'
            }`}
            onClick={() => setActiveCategory('Forms')}
          >
            <i className="pi pi-file-edit text-indigo-500"></i>
            <span>Forms</span>
          </div>
          <div 
            className={`p-3 flex align-items-center gap-2 cursor-pointer text-xs font-bold transition-all ${
              activeCategory === 'Letters' ? 'bg-indigo-50 text-indigo-950 border-left-3 border-indigo-600' : 'text-700 hover:bg-slate-100'
            }`}
            onClick={() => setActiveCategory('Letters')}
          >
            <i className="pi pi-envelope text-indigo-500"></i>
            <span>Letters</span>
          </div>
          <div 
            className={`p-3 flex align-items-center gap-2 cursor-pointer text-xs font-bold transition-all ${
              activeCategory === 'Cover Letters' ? 'bg-indigo-50 text-indigo-950 border-left-3 border-indigo-600' : 'text-700 hover:bg-slate-100'
            }`}
            onClick={() => setActiveCategory('Cover Letters')}
          >
            <i className="pi pi-copy text-indigo-500"></i>
            <span>Cover Letters</span>
          </div>
          <div className="mt-auto p-2 border-top-1 border-100 text-[9px] text-500 text-center font-mono leading-normal bg-slate-100">
            Wildcards:<br/><strong className="text-gray-700">FOR</strong> / <strong className="text-gray-700">LET</strong> / <strong className="text-gray-700">COV</strong>
          </div>
        </div>

        {/* Right Templates list pane */}
        <div className="w-8 flex flex-column bg-white overflow-y-auto custom-scrollbar">
          <div className="p-2 bg-indigo-50 text-indigo-900 text-[10px] font-bold font-mono border-bottom-1 border-100 flex justify-content-between align-items-center">
            <span>{activeCategory.toUpperCase()} SELECTOR</span>
            <span className="text-[9px] font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 border-round border-1 border-indigo-100">
              {activeCategory === 'Forms' ? 'Form' : activeCategory === 'Letters' ? 'Letter' : 'Cover'} Mode
            </span>
          </div>

          <div className="flex flex-column">
            {activeCategory === 'Forms' && [
              { name: 'Chargeback Claim Intake Form (C-102)', desc: 'Initiate regulatory cardholder dispute files' },
              { name: 'Merchant Retrieval Submission (M-441)', desc: 'File draft receipt inquiries to clearing acquirer' },
              { name: 'Pre-Arbitration Declaration (P-990)', desc: 'Official compliance folder assessment pre-filing' },
              { name: 'Financial Adjustment Authorization (F-338)', desc: 'Signoff statement credits and ledger offsets' }
            ].map(item => (
              <div 
                key={item.name}
                className="p-2.5 hover:bg-indigo-50/40 cursor-pointer transition-colors text-left flex flex-column gap-0.5 border-bottom-1 border-100"
                onClick={() => launchGenerator('Form', item.name)}
              >
                <span className="text-xs font-bold text-gray-900 leading-tight">{item.name}</span>
                <span className="text-[10px] text-gray-500 leading-normal">{item.desc}</span>
              </div>
            ))}

            {activeCategory === 'Letters' && [
              { name: 'Cardholder Dispute Acceptance', desc: 'Notify customer of successfully initiated chargeback claim' },
              { name: 'Retrieval Request Notification', desc: 'Official letter to request validation logs from card network' },
              { name: 'Merchant Settlement Agreement', desc: 'Direct merchant arbitration settlement contract' },
              { name: 'Arbitrary Compliance Warning', desc: 'Strict statutory review notice for dispute participants' }
            ].map(item => (
              <div 
                key={item.name}
                className="p-2.5 hover:bg-indigo-50/40 cursor-pointer transition-colors text-left flex flex-column gap-0.5 border-bottom-1 border-100"
                onClick={() => launchGenerator('Letter', item.name)}
              >
                <span className="text-xs font-bold text-gray-900 leading-tight">{item.name}</span>
                <span className="text-[10px] text-gray-500 leading-normal">{item.desc}</span>
              </div>
            ))}

            {activeCategory === 'Cover Letters' && [
              { name: 'Arbitration Exhibit Briefing Cover', desc: 'Transmittal page for court or arbitrator presentation' },
              { name: 'Compliance Package Transmittal Cover', desc: 'Index sheet for complete documentation portfolios' },
              { name: 'Cardholder Appeal Documentation Cover', desc: 'Formal client representation brief transmittal' },
              { name: 'Legal Counsel Document Package Cover', desc: 'Confidential legal counsel disclosure index' }
            ].map(item => (
              <div 
                key={item.name}
                className="p-2.5 hover:bg-indigo-50/40 cursor-pointer transition-colors text-left flex flex-column gap-0.5 border-bottom-1 border-100"
                onClick={() => launchGenerator('Cover Letter', item.name)}
              >
                <span className="text-xs font-bold text-gray-900 leading-tight">{item.name}</span>
                <span className="text-[10px] text-gray-500 leading-normal">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-column gap-4 w-full max-w-screen-xl mx-auto p-1 md:p-3" id="compliance-workspace-root">
      <Toast ref={toast} />

      {/* --- Page Header Banner --- */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center bg-gray-900 text-white p-4 border-round-xl shadow-3 gap-3 border-left-3 border-blue-500">
        <div>
          <div className="flex align-items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 border-round tracking-wide uppercase">Back-Office Core</span>
            <h1 className="text-xl md:text-2xl font-bold m-0 tracking-tight text-white flex align-items-center gap-2 font-sans">
              Financial Audit & Compliance Workspace
            </h1>
          </div>
          <p className="text-gray-400 m-0 mt-2 text-sm max-w-3xl leading-relaxed">
            Execute high-density dispute analysis, review Acquirer Reference Numbers (ARN), and generate legally binding cardholder notifications instantly through our dynamic Split-Pane Workspace.
          </p>
        </div>
        <div className="flex align-items-center gap-2 bg-gray-800 p-2 border-round border-1 border-gray-700">
          <i className="pi pi-shield text-blue-400 text-lg"></i>
          <span className="text-xs font-mono text-gray-300 uppercase font-bold">PCI-DSS Tokenized Layer</span>
        </div>
      </div>

      {/* --- Filter Ribbon & Action Hub --- */}
      <div className="surface-card p-3 border-round-xl border-1 border-200 shadow-1 flex flex-column gap-3">
        <div className="flex justify-content-between align-items-center pb-2 border-bottom-1 border-100">
          <span className="text-xs font-mono font-bold text-600 uppercase flex align-items-center gap-1.5">
            <i className="pi pi-cog text-blue-500"></i> Workspace Control Panel
          </span>
        </div>

        <div className="grid grid-nogutter align-items-end gap-3 md:gap-4">
          
          {/* Account Input */}
          <div className="col-12 sm:col-6 md:col-3 flex flex-column gap-1">
            <label className="text-xs font-mono font-bold text-600 uppercase flex align-items-center gap-1">
              <i className="pi pi-id-card text-gray-500"></i> Account Number
            </label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon bg-slate-50 border-1 border-300 text-500 font-mono text-xs font-bold">PAN</span>
              <InputText 
                value={filterAccount} 
                onChange={(e) => setFilterAccount(e.target.value)} 
                placeholder="e.g. 4532_"
                className="p-inputtext-sm font-mono text-xs" 
                maxLength={20}
              />
            </div>
          </div>

          {/* Case ID Input */}
          <div className="col-12 sm:col-6 md:col-2 flex flex-column gap-1">
            <label className="text-xs font-mono font-bold text-600 uppercase flex align-items-center gap-1">
              <i className="pi pi-folder text-gray-500"></i> Case Number
            </label>
            <InputText 
              value={filterCase} 
              onChange={(e) => setFilterCase(e.target.value)} 
              placeholder="Enter Case ID..."
              className="p-inputtext-sm text-xs font-mono" 
            />
          </div>

          {/* ARN Input */}
          <div className="col-12 sm:col-6 md:col-4 flex flex-column gap-1">
            <label className="text-xs font-mono font-bold text-600 uppercase flex align-items-center justify-between gap-1">
              <span className="flex align-items-center gap-1">
                <i className="pi pi-calculator text-gray-500"></i> ARN Number (23-Digit)
              </span>
              {filterArn && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 border-round ${
                  getArnValidation(filterArn).status === 'valid' ? 'bg-green-100 text-green-700' :
                  getArnValidation(filterArn).status === 'partial' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {getArnValidation(filterArn).message}
                </span>
              )}
            </label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon bg-slate-50 border-1 border-300 text-500 font-mono text-xs font-bold">ARN</span>
              <InputText 
                value={filterArn} 
                onChange={(e) => setFilterArn(e.target.value.replace(/\D/g, ''))} 
                placeholder="Enter 23-digit Acquirer Ref No..."
                className={`p-inputtext-sm text-xs font-mono ${
                  filterArn && getArnValidation(filterArn).status !== 'valid' ? 'border-orange-400 focus:shadow-none' : ''
                }`} 
                maxLength={23}
              />
            </div>
          </div>

          {/* Action Hub */}
          <div className="col-12 sm:col-6 md:col-3 flex flex-column gap-1 relative">
            <label className="text-xs font-mono font-bold text-indigo-600 uppercase flex align-items-center justify-between gap-1">
              <span className="flex align-items-center gap-1">
                <i className="pi pi-bolt text-indigo-500"></i> Command / Action Hub
              </span>
              <span className="text-[9px] font-bold text-500">Press F / L / C</span>
            </label>
            <div className="p-inputgroup">
              <InputText 
                ref={actionInputRef}
                value={actionQuery} 
                onChange={(e) => setActionQuery(e.target.value)} 
                placeholder="Type 'FOR', 'LET', 'COV'..." 
                className="p-inputtext-sm text-xs font-mono font-bold"
                style={{ borderColor: 'var(--indigo-400)' }}
              />
              <Button 
                icon="pi pi-chevron-down" 
                className="p-button-indigo p-button-sm" 
                onClick={() => setActionMenuOpen(!actionMenuOpen)} 
                aria-label="Toggle action dropdown menu"
              />
            </div>

            {/* Action Hub Popover Menu */}
            {actionMenuOpen && renderActionHubMenu()}
          </div>

        </div>
      </div>

      {/* --- Main Split-Pane Workspace --- */}
      <div className="grid gap-4" style={{ minHeight: '400px' }}>
        
        {/* --- Left Pane: Case Results Table --- */}
        <div className="col-12 lg:col-8 flex flex-column gap-3">
          <div className="surface-card border-round-xl border-1 border-200 shadow-1 flex-1 overflow-hidden">
            
            <div className="px-4 py-3 border-bottom-1 border-100 bg-slate-50 flex justify-content-between align-items-center">
              <span className="font-mono font-bold text-800 text-sm flex align-items-center gap-2">
                <i className="pi pi-list text-gray-500"></i>
                RESULTS STREAM ({filteredCases.length} Match{filteredCases.length === 1 ? '' : 'es'})
              </span>
              {selectedCase && (
                <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 border-round border-1 border-blue-100 font-bold">
                  Active Highlight: {selectedCase.caseId}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-sans text-left">
                <thead>
                  <tr className="bg-slate-100 border-bottom-1 border-200 text-600 text-xs font-mono font-bold uppercase">
                    <th className="p-3 w-3rem"></th>
                    <th className="p-3">Account No.</th>
                    <th className="p-3">Case ID</th>
                    <th className="p-3">Acquirer Ref No. (ARN)</th>
                    <th className="p-3">Workcase ID</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-500">
                        <div className="flex flex-column align-items-center gap-2">
                          <i className="pi pi-search text-2xl text-400"></i>
                          <span className="font-bold text-700">No matching dispute records located.</span>
                          <span className="text-xs text-500">Try loosening your search filters in the workspace ribbon above.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((item) => {
                      const isSelected = selectedCase?.caseId === item.caseId;
                      const isRevealed = revealedAccts[item.caseId];
                      return (
                        <tr 
                          key={item.caseId}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors border-bottom-1 border-100 ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                          onClick={() => setSelectedCase(item)}
                        >
                          <td className="p-3 text-center">
                            {isSelected ? (
                              <i className="pi pi-chevron-right text-blue-600 font-bold text-sm"></i>
                            ) : (
                              <div className="w-1rem"></div>
                            )}
                          </td>
                          <td className="p-3 font-mono">
                            <div className="flex align-items-center gap-2">
                              <span>
                                {isRevealed ? item.accountNumber : maskAccountNumber(item.accountNumber)}
                              </span>
                              {!isRevealed ? (
                                <Button
                                  icon={decryptingCaseId === item.caseId ? "pi pi-spin pi-spinner" : "pi pi-eye"}
                                  text
                                  rounded
                                  size="small"
                                  className="p-0 text-blue-500"
                                  style={{ width: '20px', height: '20px' }}
                                  tooltip="Decrypt / Audit View"
                                  tooltipOptions={{ position: 'top' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRevealAccount(item.caseId);
                                  }}
                                  disabled={decryptingCaseId === item.caseId}
                                />
                              ) : (
                                <i className="pi pi-check-circle text-green-500 text-xs" title="Decrypted and Audited"></i>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-900">
                            {item.caseId}
                          </td>
                          <td className="p-3 font-mono text-xs text-600">
                            <span title={item.arn}>
                              {item.arn.substring(0, 4)}-XXXX-XXXX-{item.arn.substring(item.arn.length - 4)}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 border-round border-1 border-200">
                              {item.workcaseId}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[11px] font-bold px-2 py-0.5 border-round-3xl ${
                              item.status === 'Under Review' ? 'bg-orange-100 text-orange-800' :
                              item.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'Pending Action' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 bg-slate-50 border-top-1 border-100 flex justify-content-between align-items-center text-xs">
              <span className="text-500 font-medium">
                Click any row above to select as active target workspace metadata.
              </span>
              <div className="flex gap-2">
                <Button 
                  label="Clear Row Focus" 
                  icon="pi pi-times" 
                  size="small" 
                  text 
                  className="p-0 text-red-500 text-xs font-bold"
                  onClick={() => setSelectedCase(null)} 
                  disabled={!selectedCase}
                />
              </div>
            </div>

          </div>
        </div>

        {/* --- Right Pane: Correspondence History & Actions --- */}
        <div className="col-12 lg:col-4 flex flex-column gap-3">
          
          {/* Quick Launch Card */}
          <Card className="shadow-1 border-1 border-200 border-round-xl p-0 overflow-hidden" id="quick-template-launch-card">
            <div className="p-3 bg-indigo-900 text-white font-mono font-bold text-xs flex justify-content-between align-items-center">
              <span>RAPID GENERATION CONTROLS</span>
              <i className="pi pi-bolt text-yellow-400"></i>
            </div>
            <div className="p-3 flex flex-column gap-3">
              <p className="text-xs text-600 m-0 leading-normal">
                Bypass the Action Hub wildcard and immediately initialize formal template workflows using active highlighted row variables:
              </p>
              
              <div className="flex flex-column gap-2">
                <Button 
                  label="Prepare Intake Form (C-102)" 
                  icon="pi pi-file-edit" 
                  className="p-button-outlined p-button-sm text-left font-bold"
                  style={{ borderRadius: '4px', border: '1px solid #c7d2fe', color: '#3730a3' }}
                  onClick={() => launchGenerator('Form', 'Chargeback Claim Intake Form (C-102)')}
                />
                <Button 
                  label="Prepare Dispute Acceptance" 
                  icon="pi pi-envelope" 
                  className="p-button-outlined p-button-sm text-left font-bold text-indigo-800"
                  style={{ borderRadius: '4px', border: '1px solid #c7d2fe', color: '#3730a3' }}
                  onClick={() => launchGenerator('Letter', 'Cardholder Dispute Acceptance')}
                />
                <Button 
                  label="Prepare Arbitration Cover Sheet" 
                  icon="pi pi-copy" 
                  className="p-button-outlined p-button-sm text-left font-bold text-indigo-800"
                  style={{ borderRadius: '4px', border: '1px solid #c7d2fe', color: '#3730a3' }}
                  onClick={() => launchGenerator('Cover Letter', 'Arbitration Exhibit Briefing Cover')}
                />
              </div>
            </div>
          </Card>

          {/* Audit Correspondence Dispatch Log */}
          <div className="surface-card border-round-xl border-1 border-200 shadow-1 flex-1 overflow-hidden flex flex-column">
            <div className="px-3 py-2 bg-slate-50 border-bottom-1 border-100 flex justify-content-between align-items-center">
              <span className="font-mono font-bold text-800 text-xs uppercase tracking-wider flex align-items-center gap-1.5">
                <i className="pi pi-history text-indigo-500"></i>
                DISPATCH ARCHIVE
              </span>
              <span className="text-[10px] font-bold text-600 font-mono">
                {generatedDocs.length} items logged
              </span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto max-h-25rem flex flex-column gap-3 custom-scrollbar">
              {generatedDocs.length === 0 ? (
                <div className="text-center py-6 text-500 flex flex-column align-items-center gap-2">
                  <i className="pi pi-envelope text-xl text-300"></i>
                  <span className="text-xs font-bold text-600">Archive is currently empty</span>
                </div>
              ) : (
                generatedDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-2.5 border-round-lg border-1 border-150 hover:bg-slate-50 transition-colors flex flex-column gap-1.5"
                    style={{ backgroundColor: '#faf9f6' }}
                  >
                    <div className="flex justify-content-between align-items-center">
                      <span className="text-[11px] font-bold font-mono text-indigo-600">
                        {doc.id}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 border-round-3xl ${
                        doc.type === 'Form' ? 'bg-blue-50 text-blue-700 border-1 border-blue-100' :
                        doc.type === 'Letter' ? 'bg-red-50 text-red-700 border-1 border-red-100' :
                        'bg-orange-50 text-orange-700 border-1 border-orange-100'
                      }`}>
                        {doc.type}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-900 leading-tight">
                      {doc.templateName}
                    </div>

                    <div className="grid grid-nogutter text-[10px] text-500 font-mono mt-1 gap-y-1">
                      <div className="col-6">Case: <span className="font-bold text-700">{doc.caseId}</span></div>
                      <div className="col-6 text-right">PAN: <span className="font-bold text-700">{doc.accountNumber.substring(doc.accountNumber.length - 4)}</span></div>
                      <div className="col-12 mt-1 truncate">ARN: <span className="font-bold text-700">{doc.arn.substring(0, 10)}...</span></div>
                    </div>

                    {doc.additionalComments && (
                      <div className="text-[10px] text-600 italic bg-white p-1.5 border-round border-1 border-100 mt-1">
                        "{doc.additionalComments}"
                      </div>
                    )}

                    <div className="text-[9px] text-400 mt-1 text-right">
                      Logged: {doc.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* --- MODAL DIALOGUE: LETTER/EMAIL/NOTICE FORM GENERATOR --- */}
      <Dialog 
        header={`${modalDocType.toUpperCase()} FORM COMPILER`} 
        visible={modalOpen} 
        style={{ width: '90vw', maxWidth: '850px' }} 
        modal 
        onHide={() => {
          setModalOpen(false);
          actionInputRef.current?.focus();
        }}
        id="correspondence-form-dialog"
        footer={
          <div className="flex justify-content-end gap-2 pt-2 border-top-1 border-100">
            <Button 
              label="Cancel (Esc)" 
              icon="pi pi-times" 
              outlined 
              severity="secondary" 
              className="p-button-sm text-xs font-bold" 
              style={{ borderRadius: '4px' }}
              onClick={() => {
                setModalOpen(false);
                actionInputRef.current?.focus();
              }} 
            />
            <Button 
              label={generating ? "Compiling PDF..." : `Generate ${modalDocType} & Record`} 
              icon={generating ? "pi pi-spin pi-spinner" : "pi pi-check"} 
              severity="success"
              className="p-button-sm text-xs font-bold" 
              style={{ borderRadius: '4px' }}
              onClick={handleGenerateCorrespondence}
              disabled={generating}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3 py-2">
          
          {/* Active selection feedback */}
          {selectedCase ? (
            <div className="flex align-items-center gap-2 bg-green-50 text-green-900 p-2.5 border-round border-1 border-green-200 text-xs">
              <i className="pi pi-check-circle text-green-600 text-sm"></i>
              <span>
                <strong>Smart Data Ingest Succeeded:</strong> Sourced active record variables from selected Case ID <strong className="font-mono">{selectedCase.caseId}</strong> directly.
              </span>
            </div>
          ) : (
            <div className="flex align-items-center gap-2 bg-orange-50 text-orange-900 p-2.5 border-round border-1 border-orange-200 text-xs">
              <i className="pi pi-exclamation-triangle text-orange-600 text-sm"></i>
              <span>
                <strong>Fallback Input Mode:</strong> No active transaction row is selected. Please manually input required Case metadata variables below.
              </span>
            </div>
          )}

          {/* Template select option radio pills */}
          <div className="flex flex-column gap-1">
            <span className="text-xs font-mono font-bold text-600 uppercase">Select Correspondence Template</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {modalDocType === 'Form' && [
                'Chargeback Claim Intake Form (C-102)',
                'Merchant Retrieval Submission (M-441)',
                'Pre-Arbitration Declaration (P-990)',
                'Financial Adjustment Authorization (F-338)'
              ].map(t => (
                <button 
                  key={t}
                  type="button"
                  className={`px-3 py-2 text-xs font-bold border-round-lg border-1 cursor-pointer transition-all ${
                    selectedTemplate === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-2' : 'bg-white text-700 border-300 hover:surface-hover'
                  }`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  {t}
                </button>
              ))}

              {modalDocType === 'Letter' && [
                'Cardholder Dispute Acceptance',
                'Retrieval Request Notification',
                'Merchant Settlement Agreement',
                'Arbitrary Compliance Warning'
              ].map(t => (
                <button 
                  key={t}
                  type="button"
                  className={`px-3 py-2 text-xs font-bold border-round-lg border-1 cursor-pointer transition-all ${
                    selectedTemplate === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-2' : 'bg-white text-700 border-300 hover:surface-hover'
                  }`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  {t}
                </button>
              ))}

              {modalDocType === 'Cover Letter' && [
                'Arbitration Exhibit Briefing Cover',
                'Compliance Package Transmittal Cover',
                'Cardholder Appeal Documentation Cover',
                'Legal Counsel Document Package Cover'
              ].map(t => (
                <button 
                  key={t}
                  type="button"
                  className={`px-3 py-2 text-xs font-bold border-round-lg border-1 cursor-pointer transition-all ${
                    selectedTemplate === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-2' : 'bg-white text-700 border-300 hover:surface-hover'
                  }`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Injected Metadata / Manual Inputs */}
          <div className="grid gap-3 mt-1">
            
            {/* PAN Variable */}
            <div className="col-12 md:col-4 flex flex-column gap-1">
              <label className="text-[11px] font-mono font-bold text-600 uppercase">
                Account No. (PAN)
              </label>
              <InputText 
                value={injectedAcct}
                onChange={(e) => setInjectedAcct(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                disabled={!!selectedCase}
                className="p-inputtext-sm text-xs font-mono font-bold w-full"
              />
            </div>

            {/* Case ID Variable */}
            <div className="col-12 md:col-4 flex flex-column gap-1">
              <label className="text-[11px] font-mono font-bold text-600 uppercase">
                Case Number Reference
              </label>
              <InputText 
                value={injectedCase}
                onChange={(e) => setInjectedCase(e.target.value)}
                placeholder="e.g. CS-99000"
                disabled={!!selectedCase}
                className="p-inputtext-sm text-xs font-mono font-bold w-full"
              />
            </div>

            {/* ARN Variable */}
            <div className="col-12 md:col-4 flex flex-column gap-1">
              <label className="text-[11px] font-mono font-bold text-600 uppercase flex justify-between">
                <span>ARN Reference</span>
                {injectedArn && (
                  <span className={`text-[9px] font-bold ${getArnValidation(injectedArn).status === 'valid' ? 'text-green-600' : 'text-orange-500'}`}>
                    {getArnValidation(injectedArn).message}
                  </span>
                )}
              </label>
              <InputText 
                value={injectedArn}
                onChange={(e) => setInjectedArn(e.target.value)}
                placeholder="23-digit ref number"
                disabled={!!selectedCase}
                className="p-inputtext-sm text-xs font-mono font-bold w-full font-sans"
                maxLength={23}
              />
            </div>

          </div>

          {/* Core override and custom inputs */}
          <div className="flex flex-column gap-1 mt-1">
            <label className="text-xs font-mono font-bold text-600 uppercase flex justify-between">
              <span>Additional Comments / Adjustments Override</span>
              <span className="text-500 font-normal">Appends seamlessly into preview below</span>
            </label>
            <textarea 
              rows={2} 
              value={overrideComments}
              onChange={(e) => setOverrideComments(e.target.value)}
              placeholder="e.g. Please insert text here to override default template text or add specific riders..."
              className="p-2 border-1 border-300 border-round text-xs font-sans w-full outline-none focus:border-indigo-500 custom-scrollbar"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Letter / Email Canvas Preview */}
          <div className="flex flex-column gap-1 mt-1">
            <span className="text-xs font-mono font-bold text-600 uppercase">Interactive Correspondence Preview</span>
            <div 
              className="p-4 border-1 border-300 border-round bg-amber-50/15 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner overflow-y-auto"
              style={{ maxHeight: '200px', backgroundColor: '#fcfbf7', color: '#2d3748', borderLeft: '4px solid #4f46e5' }}
            >
              {getCompiledPreview()}
            </div>
          </div>

        </div>
      </Dialog>
    </div>
  );
};

export default CaseManagementDashboard;
