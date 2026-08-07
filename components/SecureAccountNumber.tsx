
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { decryptAccountNumber } from '../services/mockApi';

interface SecureAccountNumberProps {
    encryptedAccountNumber: string;
    className?: string;
    label?: string; // e.g. "Card Number"
}

export const SecureAccountNumber: React.FC<SecureAccountNumberProps> = ({ 
    encryptedAccountNumber, 
    className = '',
    label
}) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [realValue, setRealValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    
    const timerRef = useRef<number | null>(null);
    const REVEAL_DURATION = 30; // seconds

    const cleanUp = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return cleanUp;
    }, []);

    // Timer logic
    useEffect(() => {
        if (isRevealed && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleMask(); // Auto-mask when time hits 0
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [isRevealed]); // Re-run if reveal state changes, but rely on timeLeft for tick

    const handleReveal = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row clicks in tables
        
        if (isRevealed) {
            handleMask();
            return;
        }

        setLoading(true);
        try {
            // Check if we already fetched it once to save API calls (optional cache logic)
            let val = realValue;
            if (!val) {
                // Use the encrypted account number for the API call
                val = await decryptAccountNumber(encryptedAccountNumber);
                setRealValue(val);
            }

            setIsRevealed(true);
            setTimeLeft(REVEAL_DURATION);
            
        } catch (error) {
            console.error("Decryption failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMask = () => {
        cleanUp();
        setIsRevealed(false);
        setTimeLeft(0);
    };

    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (realValue) {
            navigator.clipboard.writeText(realValue.replace(/\s/g, ''));
        }
    };

    // Generate mask: First 6 digits, 6 asterisks, Last 4 digits.
    // Example: 123456******3456
    const getMaskedDisplay = (val: string) => {
        if (!val) return '';
        // Clean spaces if any
        const clean = val.replace(/\s/g, '');
        if (clean.length >= 10) {
            // Take first 6, add 6 stars, take last 4
            // Note: If input is exactly 16 digits, this matches the user request perfectly.
            const first6 = clean.substring(0, 6);
            const last4 = clean.substring(clean.length - 4);
            return `${first6}******${last4}`;
        }
        return '**** **** **** ****'; // Fallback for short/invalid formats
    };

    const maskedDisplay = getMaskedDisplay(encryptedAccountNumber);

    return (
        <div className={`flex flex-column ${className}`}>
            {label && <span className="text-xs text-500 mb-1">{label}</span>}
            
            <div 
                className={`
                    flex align-items-center gap-2 cursor-pointer select-none transition-colors p-1 border-round -ml-1
                    ${isRevealed ? 'text-900 bg-surface-100' : 'text-700 hover:bg-surface-100'}
                `}
                onClick={handleReveal}
                role="button"
                tabIndex={0}
                aria-label={isRevealed ? "Hide account number" : "Show account number"}
                title={isRevealed ? "Click to mask" : "Click to decrypt and reveal"}
            >
                <i className={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-credit-card'} ${isRevealed ? 'text-primary' : 'text-500'}`}></i>
                
                <span className={`font-mono text-sm ${isRevealed ? 'font-bold' : ''}`}>
                    {loading ? 'Decrypting...' : isRevealed ? realValue : maskedDisplay}
                </span>

                {isRevealed && (
                    <div className="flex align-items-center gap-2 ml-2 fadein animation-duration-200">
                         <Button 
                            icon="pi pi-copy" 
                            text 
                            rounded 
                            severity="secondary" 
                            size="small" 
                            className="w-1.5rem h-1.5rem p-0 bg-white shadow-sm"
                            onClick={copyToClipboard}
                            tooltip="Copy"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
