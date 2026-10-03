import type { ReactNode } from 'react';
import './PropertyList.css';

export interface PropertyListItem {
    key: string;
    label: string;
    value: ReactNode;
    /** Optional control aligned to the right of the value (e.g. a "Change" button). */
    action?: ReactNode;
}

/** Dense label/value list for the properties of a record. */
function PropertyList({ items }: { items: PropertyListItem[] }) {
    return (
        <dl className="rmz-property-list">
            {items.map((item) => (
                <div key={item.key} className="rmz-property-list__row">
                    <dt className="rmz-property-list__label">{item.label}</dt>
                    <dd className="rmz-property-list__value">
                        <div className="rmz-property-list__content">{item.value}</div>
                        {item.action && <div className="rmz-property-list__action">{item.action}</div>}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export default PropertyList;
