import { useContext } from 'react';
import { AlertContext, type AlertApi } from './AlertContext.ts';

export function useAlert(): AlertApi {
    const api = useContext(AlertContext);
    if (!api) throw new Error('useAlert must be used inside an AlertProvider');
    return api;
}
