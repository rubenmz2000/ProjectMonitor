import { Outlet, useLocation, useMatch } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import FolderIcon from '@mui/icons-material/FolderOutlined';
import ListAltIcon from '@mui/icons-material/ListAltOutlined';
import { AppShell, Sidebar, TopBar, Breadcrumbs } from '../../rmz-ui/index.ts';
import type { SidebarSection, BreadcrumbItem } from '../../rmz-ui/index.ts';
import RouteProjectProvider from './RouteProjectProvider.tsx';
import { useRouteProject } from './useRouteProject.ts';
import CurrentActorChip from './CurrentActorChip.tsx';

/**
 * Project Monitor's composition of the generic shell: global navigation, contextual navigation
 * for the project the current route belongs to, breadcrumbs and the current actor.
 */
function ShellFrame() {
    const { prefix, project } = useRouteProject();
    const location = useLocation();
    const issueIdentifier = useMatch('/issues/:issueIdentifier')?.params.issueIdentifier;

    const sections: SidebarSection[] = [
        {
            key: 'global',
            items: [
                { key: 'dashboard', label: 'Dashboard', to: '/', icon: <DashboardIcon />, end: true },
                { key: 'projects', label: 'Projects', to: '/projects', icon: <FolderIcon />, end: true },
            ],
        },
    ];
    if (prefix) {
        sections.push({
            key: `project-${prefix}`,
            title: project ? `${project.name} (${prefix})` : prefix,
            items: [
                { key: 'issues', label: 'Issues', to: `/projects/${prefix}/issues`, icon: <ListAltIcon /> },
            ],
        });
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    if (location.pathname === '/') {
        breadcrumbs.push({ key: 'dashboard', label: 'Dashboard' });
    } else {
        breadcrumbs.push({ key: 'projects', label: 'Projects', to: '/projects' });
        if (prefix) {
            breadcrumbs.push({ key: 'project', label: project?.name ?? prefix, to: `/projects/${prefix}/issues` });
        }
        if (issueIdentifier) {
            breadcrumbs.push({ key: 'issue', label: issueIdentifier.toUpperCase() });
        }
    }

    return (
        <AppShell
            sidebar={({ collapsed, toggle }) => (
                <Sidebar sections={sections} collapsed={collapsed} onToggle={toggle} />
            )}
            topBar={<TopBar left={<Breadcrumbs items={breadcrumbs} />} right={<CurrentActorChip />} />}
        >
            <Outlet />
        </AppShell>
    );
}

function ProjectMonitorShell() {
    return (
        <RouteProjectProvider>
            <ShellFrame />
        </RouteProjectProvider>
    );
}

export default ProjectMonitorShell;
