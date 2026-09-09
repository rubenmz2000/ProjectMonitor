import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { AlertContext, type AlertSeverity } from './AlertContext.ts';

/** Application-wide transient notifications (snackbar). Use with `useAlert()`. */
function AlertProvider({ children, autoHideMs = 4000 }: { children: ReactNode, autoHideMs?: number }) {
    const [state, setState] = useState<{ open: boolean, message: string, severity: AlertSeverity }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const notify = useCallback((message: string, severity: AlertSeverity = 'success') => {
        setState({ open: true, message, severity });
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setState((prev) => ({ ...prev, open: false }));
    };

    return (
        <AlertContext.Provider value={{ notify }}>
            {children}
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={state.open}
                autoHideDuration={autoHideMs}
                onClose={handleClose}
            >
                <Alert severity={state.severity} variant="filled" onClose={handleClose}>
                    {state.message}
                </Alert>
            </Snackbar>
        </AlertContext.Provider>
    );
}

export default AlertProvider;
