
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { logout } from '../slices/authSlice';
import { RootState, AppDispatch } from '../store';

// Configuration: 1 Minute Idle -> 1 Minute Warning -> Logout
const WARNING_DURATION_S = 60;
const WARNING_THRESHOLD_MS = WARNING_DURATION_S * 1000;
const IDLE_BEFORE_WARNING_MS = 60 * 1000; 
const SESSION_TIMEOUT_MS = IDLE_BEFORE_WARNING_MS + WARNING_THRESHOLD_MS;

const TICK_INTERVAL_MS = 1000;
const STORAGE_ACTIVITY_KEY = 'disputehub_last_activity';
const STORAGE_LOGOUT_KEY = 'disputehub_logout_event';

export const SessionTimeout: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    const [showWarning, setShowWarning] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(WARNING_DURATION_S);
    
    const tickRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(Date.now());

    const handleLogout = useCallback((broadcast = true) => {
        if (broadcast) {
            localStorage.setItem(STORAGE_LOGOUT_KEY, Date.now().toString());
        }
        dispatch(logout());
        setShowWarning(false);
        if (tickRef.current) window.clearInterval(tickRef.current);
    }, [dispatch]);

    const recordActivity = useCallback(() => {
        const now = Date.now();
        if (now - lastUpdateRef.current > 2000) {
            localStorage.setItem(STORAGE_ACTIVITY_KEY, now.toString());
            lastUpdateRef.current = now;
        }
    }, []);

    const extendSession = () => {
        const now = Date.now();
        localStorage.setItem(STORAGE_ACTIVITY_KEY, now.toString());
        lastUpdateRef.current = now;
        setShowWarning(false);
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        if (!localStorage.getItem(STORAGE_ACTIVITY_KEY)) {
            localStorage.setItem(STORAGE_ACTIVITY_KEY, Date.now().toString());
        }

        tickRef.current = window.setInterval(() => {
            const lastActivity = parseInt(localStorage.getItem(STORAGE_ACTIVITY_KEY) || '0');
            const now = Date.now();
            const idleTime = now - lastActivity;

            if (idleTime >= SESSION_TIMEOUT_MS) {
                handleLogout(true);
            } else if (idleTime >= IDLE_BEFORE_WARNING_MS) {
                const timeLeft = Math.ceil((SESSION_TIMEOUT_MS - idleTime) / 1000);
                setRemainingSeconds(Math.max(0, timeLeft));
                setShowWarning(true);
            } else {
                if (showWarning) setShowWarning(false);
            }
        }, TICK_INTERVAL_MS);

        return () => {
            if (tickRef.current) window.clearInterval(tickRef.current);
        };
    }, [isAuthenticated, handleLogout, showWarning]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousedown', 'keydown', 'scroll', 'click'];
        const handler = () => recordActivity();

        events.forEach(event => window.addEventListener(event, handler));
        
        const storageHandler = (e: StorageEvent) => {
            if (e.key === STORAGE_LOGOUT_KEY) {
                dispatch(logout());
                setShowWarning(false);
            }
            if (e.key === STORAGE_ACTIVITY_KEY) {
                const lastActivity = parseInt(e.newValue || '0');
                const now = Date.now();
                if (now - lastActivity < IDLE_BEFORE_WARNING_MS) {
                    setShowWarning(false);
                }
            }
        };

        window.addEventListener('storage', storageHandler);

        return () => {
            events.forEach(event => window.removeEventListener(event, handler));
            window.removeEventListener('storage', storageHandler);
        };
    }, [isAuthenticated, recordActivity, dispatch]);

    if (!isAuthenticated) return null;

    const progressValue = (remainingSeconds / WARNING_DURATION_S) * 100;
    const isCritical = remainingSeconds <= 15;

    return (
        <Dialog 
            visible={showWarning} 
            closable={false}
            modal
            onHide={() => {}} 
            header={
                <div className="flex align-items-center gap-2">
                    <i className={`pi pi-exclamation-triangle ${isCritical ? 'text-red-500' : 'text-orange-500'} text-xl`}></i>
                    <span>Security: Session Expiring</span>
                </div>
            }
            footer={
                <div className="flex gap-2 w-full">
                    <Button label="Sign Out" icon="pi pi-power-off" onClick={() => handleLogout(true)} className="p-button-text p-button-secondary flex-1" />
                    <Button label="Stay Connected" icon="pi pi-refresh" onClick={extendSession} className="p-button-primary flex-1 shadow-2" autoFocus />
                </div>
            }
            style={{ width: '90vw', maxWidth: '400px' }}
        >
            <div className="flex flex-column align-items-center text-center py-3">
                <p className="text-700 mb-4">You have been idle. You will be logged out in:</p>
                <div className="w-full mb-3">
                    <div className="flex justify-content-between mb-2">
                        <span className="text-xs font-bold text-500 uppercase">Countdown</span>
                        <span className={`text-lg font-bold ${isCritical ? 'text-red-600 pulse' : 'text-primary'}`}>
                            {remainingSeconds}s
                        </span>
                    </div>
                    <ProgressBar value={progressValue} showValue={false} style={{ height: '8px' }} color={isCritical ? 'var(--red-500)' : 'var(--primary-500)'} />
                </div>
            </div>
            <style>{`
                @keyframes pulse-text { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .pulse { animation: pulse-text 1s infinite; }
            `}</style>
        </Dialog>
    );
};
