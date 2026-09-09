import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RmzThemeProvider, AlertProvider } from './rmz-ui/index.ts';
import ProjectMonitorShell from './app/shell/ProjectMonitorShell.tsx';
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import Projects from './pages/Projects/Projects.tsx';
import ProjectIssues from './pages/ProjectIssues/ProjectIssues.tsx';
import IssueDetail from './pages/IssueDetail/IssueDetail.tsx';
import ProjectPrefixRedirect from './app/shell/ProjectPrefixRedirect.tsx';

function App() {
    return (
        <RmzThemeProvider>
            <AlertProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<ProjectMonitorShell />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            {/* The project page itself is defined in a later issue; until then land on its issues */}
                            <Route path="/projects/:prefix" element={<ProjectPrefixRedirect />} />
                            <Route path="/projects/:prefix/issues" element={<ProjectIssues />} />
                            <Route path="/issues/:issueIdentifier" element={<IssueDetail />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AlertProvider>
        </RmzThemeProvider>
    );
}

export default App;
