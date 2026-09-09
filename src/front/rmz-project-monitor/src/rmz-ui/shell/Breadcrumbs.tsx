import { Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
    key: string;
    label: string;
    /** Omit on the current (last) item. */
    to?: string;
}

/** Generic breadcrumb trail driven by data; the application decides what the trail is. */
function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <MuiBreadcrumbs
            className="rmz-breadcrumbs"
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="Breadcrumb"
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                if (item.to && !isLast) {
                    return (
                        <Link key={item.key} to={item.to} className="rmz-breadcrumbs__link">
                            {item.label}
                        </Link>
                    );
                }
                return (
                    <Typography key={item.key} className="rmz-breadcrumbs__current" component="span">
                        {item.label}
                    </Typography>
                );
            })}
        </MuiBreadcrumbs>
    );
}

export default Breadcrumbs;
