
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { logout } from '../slices/authSlice';
import { RootState, AppDispatch } from '../store';
import NewWindow from 'react-new-window';

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 15 Minutes
const WARNING_THRESHOLD_MS = 60 * 1000;    // 1 Minute warning
const COUNTDOWN_STEP_MS = 1000;            // Tick every second
const STORAGE_ACTIVITY_KEY = 'primesecure_last_activity';
const STORAGE_LOGOUT_KEY = 'primesecure_logout_event';

export const SessionTimeout: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    const [showWarning, setShowWarning] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(WARNING_THRESHOLD_MS / 1000);
    
    // Fix: Using any for timeout refs to avoid NodeJS.Timeout type errors in browser environment
    const timeoutRef = useRef<any>(null);
    const countdownRef = useRef<any>(null);
    const lastStorageWriteRef = useRef<number>(0);

    const handleLogout = useCallback((broadcast = true) => {
        if (broadcast) {
            localStorage.setItem(STORAGE_LOGOUT_KEY, Date.now().toString());
        }
        dispatch(logout());
        setShowWarning(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        window.location.reload();
    }, [dispatch]);

    const resetLocalTimer = useCallback((updateStorage = true) => {
        // If we are resetting because of remote activity, hide the warning if it's up
        if (!updateStorage) {
            setShowWarning(false);
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Update storage throttled to 2 seconds
        if (updateStorage && isAuthenticated) {
            const now = Date.now();
            if (now - lastStorageWriteRef.current > 2000) {
                localStorage.setItem(STORAGE_ACTIVITY_KEY, now.toString());
                lastStorageWriteRef.current = now;
            }
        }

        timeoutRef.current = setTimeout(() => {
            setShowWarning(true);
            setRemainingSeconds(WARNING_THRESHOLD_MS / 1000);
        }, SESSION_TIMEOUT_MS - WARNING_THRESHOLD_MS);
    }, [isAuthenticated]);

    // Track user activity on current tab
    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        const activityHandler = () => {
            if (!showWarning) resetLocalTimer(true);
        };

        events.forEach(event => window.addEventListener(event, activityHandler));
        resetLocalTimer(false);

        return () => {
            events.forEach(event => window.removeEventListener(event, activityHandler));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isAuthenticated, resetLocalTimer, showWarning]);

    // Listen for activity or logout events from OTHER tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_ACTIVITY_KEY) {
                resetLocalTimer(false); 
            } else if (e.key === STORAGE_LOGOUT_KEY) {
                handleLogout(false);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [resetLocalTimer, handleLogout]);

    // Handle countdown when warning is shown
    useEffect(() => {
        if (showWarning) {
            countdownRef.current = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        handleLogout(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, COUNTDOWN_STEP_MS);
        } else {
            if (countdownRef.current) clearInterval(countdownRef.current);
        }

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [showWarning, handleLogout]);

    const extendSession = () => {
        setShowWarning(false);
        resetLocalTimer(true);
    };

    if (!isAuthenticated) return null;

    const progressValue = (remainingSeconds / (WARNING_THRESHOLD_MS / 1000)) * 100;

    return (
        <>
            {showWarning && (
                <NewWindow 
                    title="Security Warning: Session Expiring" 
                    features={{ width: 450, height: 400 }}
                    center="screen"
                    onUnload={extendSession} // Treat closing the popup as extending to prevent accidental logout
                >
                    <div className="session-popup-container" style={{ 
                        fontFamily: 'var(--font-family, sans-serif)', 
                        padding: '2rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        textAlign: 'center',
                        height: '100vh',
                        backgroundColor: '#fff',
                        margin: 0
                    }}>
                        {/* Import styles specifically for the portal window */}
                        <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
                        <link rel="stylesheet" href="https://unpkg.com/primereact/resources/primereact.min.css" />
                        <link rel="stylesheet" href="https://unpkg.com/primereact/resources/themes/lara-light-cyan/theme.css" />
                        <link rel="stylesheet" href="https://unpkg.com/primeflex@3.3.1/primeflex.min.css" />

                        <i className="pi pi-exclamation-triangle text-yellow-500 mb-4" style={{ fontSize: '4rem' }}></i>
                        
                        <h2 className="text-900 font-bold text-2xl mb-2">Inactivity Warning</h2>
                        <p className="text-600 mb-4 px-3">
                            For your protection, your session is about to expire. Click below to continue working.
                        </p>
                        
                        <div className="w-full mb-5">
                            <div className="flex justify-content-between mb-2">
                                <span className="text-xs font-bold text-500 uppercase">Automatic Logout In</span>
                                <span className={`text-xs font-bold ${remainingSeconds < 10 ? 'text-red-500' : 'text-primary'}`}>{remainingSeconds}s</span>
                            </div>
                            <ProgressBar value={progressValue} showValue={false} style={{ height: '8px' }} color={remainingSeconds < 10 ? '#ef4444' : '#06b6d4'}></ProgressBar>
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button label="Logout" icon="pi pi-power-off" onClick={() => handleLogout(true)} className="p-button-outlined p-button-danger flex-1" />
                            <Button label="Stay Connected" icon="pi pi-refresh" onClick={extendSession} className="p-button-primary flex-1 shadow-2" autoFocus />
                        </div>
                        
                        <div className="mt-4 text-xs text-400">
                            Security Tracking ID: {Date.now().toString().slice(-6)}
                        </div>
                    </div>
                </NewWindow>
            )}
        </>
    );
};
