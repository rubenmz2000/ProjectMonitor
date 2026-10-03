import type { ReactNode } from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
    title: ReactNode;
    /** Rendered before the title on the same line (e.g. an identifier chip). */
    leading?: ReactNode;
    /** Rendered right after the title on the same line (e.g. a status). */
    titleAdornment?: ReactNode;
    /** Primary actions, aligned to the right of the title row. */
    actions?: ReactNode;
    /** Secondary content below the title row (description, meta, summaries). */
    children?: ReactNode;
}

/** Generic page header: a title row with optional leading/trailing elements and actions. */
function PageHeader({ title, leading, titleAdornment, actions, children }: PageHeaderProps) {
    return (
        <header className="rmz-page-header">
            <div className="rmz-page-header__row">
                <div className="rmz-page-header__heading">
                    {leading && <div className="rmz-page-header__leading">{leading}</div>}
                    <h1 className="rmz-page-header__title">{title}</h1>
                    {titleAdornment && <div className="rmz-page-header__adornment">{titleAdornment}</div>}
                </div>
                {actions && <div className="rmz-page-header__actions">{actions}</div>}
            </div>
            {children && <div className="rmz-page-header__body">{children}</div>}
        </header>
    );
}

export default PageHeader;
