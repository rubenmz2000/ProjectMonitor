import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RmzThemeProvider, AlertProvider } from './rmz-ui/index.ts';
import ProjectMonitorShell from './app/shell/ProjectMonitorShell.tsx';
import ProjectWorkspace from './app/project/ProjectWorkspace.tsx';
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import Projects from './pages/Projects/Projects.tsx';
import ProjectIssues from './pages/ProjectIssues/ProjectIssues.tsx';
import IssueDetail from './pages/IssueDetail/IssueDetail.tsx';

function App() {
    return (
        <RmzThemeProvider>
            <AlertProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<ProjectMonitorShell />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            {/* Project workspace: shared header; each project area is a child route */}
                            <Route path="/projects/:prefix" element={<ProjectWorkspace />}>
                                <Route index element={<Navigate to="issues" replace />} />
                                <Route path="issues" element={<ProjectIssues />} />
                            </Route>
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
