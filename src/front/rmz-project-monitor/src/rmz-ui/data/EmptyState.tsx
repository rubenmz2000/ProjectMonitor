import type { ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
}

/** Generic placeholder for an empty or errored list/section. */
function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="rmz-empty-state">
            {icon && <div className="rmz-empty-state__icon">{icon}</div>}
            <div className="rmz-empty-state__title">{title}</div>
            {description && <div className="rmz-empty-state__description">{description}</div>}
            {action && <div className="rmz-empty-state__action">{action}</div>}
        </div>
    );
}

export default EmptyState;
