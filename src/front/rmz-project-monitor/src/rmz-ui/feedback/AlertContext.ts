import { createContext } from 'react';

export type AlertSeverity = 'success' | 'error' | 'info' | 'warning';

export interface AlertApi {
    /** Shows a transient notification. Defaults to a success message. */
    notify: (message: string, severity?: AlertSeverity) => void;
}

export const AlertContext = createContext<AlertApi | null>(null);
