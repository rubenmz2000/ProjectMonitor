import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Brand from './Brand.tsx';
import './Sidebar.css';

export interface SidebarItem {
    key: string;
    label: string;
    to: string;
    icon?: ReactNode;
    /** Match the route exactly (NavLink `end`). */
    end?: boolean;
}

export interface SidebarSection {
    key: string;
    /** Optional heading; sections without a title render as a plain group. */
    title?: string;
    items: SidebarItem[];
}

export interface SidebarProps {
    sections: SidebarSection[];
    collapsed: boolean;
    onToggle: () => void;
    /** Where the brand links to (defaults to "/"). */
    homeTo?: string;
}

/**
 * Generic navigation sidebar: a brand, a list of sections with links, and a collapse toggle.
 * Sections are data, so applications add contextual navigation without touching this component.
 */
function Sidebar({ sections, collapsed, onToggle, homeTo = '/' }: SidebarProps) {
    return (
        <nav className={`rmz-sidebar${collapsed ? ' rmz-sidebar--collapsed' : ''}`} aria-label="Main navigation">
            <div className="rmz-sidebar__brand">
                <Brand to={homeTo} compact={collapsed} />
            </div>

            <div className="rmz-sidebar__sections">
                {sections.map((section) => (
                    <div key={section.key} className="rmz-sidebar__section">
                        {section.title && !collapsed && (
                            <div className="rmz-sidebar__section-title" title={section.title}>{section.title}</div>
                        )}
                        <ul className="rmz-sidebar__items">
                            {section.items.map((item) => {
                                const link = (
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) => `rmz-sidebar__item${isActive ? ' rmz-sidebar__item--active' : ''}`}
                                    >
                                        <span className="rmz-sidebar__item-icon">{item.icon}</span>
                                        {!collapsed && <span className="rmz-sidebar__item-label">{item.label}</span>}
                                    </NavLink>
                                );
                                return (
                                    <li key={item.key}>
                                        {collapsed ? <Tooltip title={item.label} placement="right">{link}</Tooltip> : link}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="rmz-sidebar__footer">
                <IconButton size="small" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                </IconButton>
            </div>
        </nav>
    );
}

export default Sidebar;
