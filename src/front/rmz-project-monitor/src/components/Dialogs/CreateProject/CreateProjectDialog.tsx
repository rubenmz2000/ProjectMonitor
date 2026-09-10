import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import './CreateProjectDialog.css';
import {addProject} from '../../../serivces/ApiService.ts'

function generateIssuePrefix(projectName: string): string {
    if (!projectName.trim()) return '';
    
    const words = projectName.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length > 1) {
        // Multiple words: take initials
        return words.slice(0, 5).map(w => w[0]).join('').toUpperCase();
    } else {
        // Single word: take first 3 alphanumeric characters
        const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return cleanName.slice(0, 3);
    }
}

export default function CreateProjectDialog({open, onClose}: {open: boolean, onClose: (result: string) => void}) {
    const [projectName, setProjectName] = useState('');
    const [issuePrefix, setIssuePrefix] = useState('');
    const [suggestedPrefix, setSuggestedPrefix] = useState('');
    
    useEffect(() => {
        const suggested = generateIssuePrefix(projectName);
        setSuggestedPrefix(suggested);
        // Auto-fill if user hasn't manually edited the prefix
        if (!issuePrefix || issuePrefix === suggestedPrefix) {
            setIssuePrefix(suggested);
        }
    }, [projectName]);
    
    const HandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fromJson = Object.fromEntries(formData.entries());
        
        try {
            await addProject(fromJson);
            onClose("submit");
            // Reset form
            setProjectName('');
            setIssuePrefix('');
            setSuggestedPrefix('');
        } catch (e) {
            onClose("error");
        }
    }
    
    const handleClose = () => {
        onClose('cancel');
        // Reset form
        setProjectName('');
        setIssuePrefix('');
        setSuggestedPrefix('');
    }
    
    return <>
        <Dialog className={'create-dialog'} open={open}>
            <DialogTitle>Create Project</DialogTitle>
            <Divider />
            <DialogContent>
                <DialogContentText>Create a new project</DialogContentText>
                <form className={"create-dialog-inputs"} id={"project-form"} onSubmit={HandleSubmit}>
                    <TextField 
                        required 
                        name={"name"} 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        label={"Project name"} 
                    />
                    <TextField 
                        required 
                        name={"description"} 
                        multiline 
                        label={"Project description"} 
                    />
                    <TextField 
                        name={"issuePrefix"} 
                        value={issuePrefix}
                        onChange={(e) => setIssuePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                        label={"Issue Prefix"} 
                        helperText={suggestedPrefix ? `Suggested: ${suggestedPrefix}` : "Auto-generated from name if empty. Max 5 alphanumeric chars."}
                        slotProps={{ htmlInput: { maxLength: 5, pattern: '[A-Za-z0-9]*' } }}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type={"submit"} form={"project-form"}>Save</Button>
            </DialogActions>
        </Dialog>
    </>
}
