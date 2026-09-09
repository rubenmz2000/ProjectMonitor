import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Header from './components/Header/Header.tsx'
import Footer from './rmz-ui/components/Footer.tsx'
import Dashboard from './pages/Dashboard/Dashboard.tsx'
import Projects from './pages/Projects/Projects.tsx';
import ProjectIssues from './pages/ProjectIssues/ProjectIssues.tsx';
import IssueDetail from './pages/IssueDetail/IssueDetail.tsx';
import {Alert, Snackbar} from '@mui/material';

function App() {
    const [alert, setAlert] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    const triggerAlert = (message: string, severity: string = 'success') => {
        setAlert({
            open: true,
            message: message,
            severity: severity
        });
    }
    
    const handleCloseAlert = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setAlert(prev => ({ ...prev, open: false }));
    }
    
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
            <Route path="/" element={<Dashboard triggerAlert={triggerAlert} />} />
            <Route path="/projects" element={<Projects triggerAlert={triggerAlert} />} />
            <Route path="/projects/:projectId/issues" element={<ProjectIssues triggerAlert={triggerAlert} />} />
            <Route path="/issues/:issueIdentifier" element={<IssueDetail />} />
        </Routes>
      </main>
      <Footer />

        <Snackbar className="alert"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={alert.open}
            autoHideDuration={4000}
            onClose={handleCloseAlert}
        >
            <Alert severity={alert.severity as 'success' | 'error' | 'info' | 'warning'} variant={"filled"}>{alert.message}</Alert> 
        </Snackbar>
    </BrowserRouter>
  )
}

export default App
