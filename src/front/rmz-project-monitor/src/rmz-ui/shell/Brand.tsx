import { Link } from 'react-router-dom';
import './Brand.css';

/** RMZ Softwares wordmark. `compact` shows only the monogram (for a collapsed sidebar). */
function Brand({ to = '/', compact = false }: { to?: string, compact?: boolean }) {
    return (
        <Link to={to} className="rmz-brand" aria-label="RMZ Softwares">
            {compact ? (
                <span className="rmz-brand__mark">RMZ</span>
            ) : (
                <span className="rmz-brand__wordmark">RMZ <span>SOFTWARES</span></span>
            )}
        </Link>
    );
}

export default Brand;
