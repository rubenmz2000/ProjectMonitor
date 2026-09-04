import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import './CreateProjectDialog.css';
import '../../../rmz-ui/rmz-theme.css';
import {addProject} from '../../../serivces/ApiService.ts'

export default function CreateProjectDialog({open, onClose}: {open: boolean, onClose: (result: string) => void}) {
    
    const HandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fromJson = Object.fromEntries(formData.entries());
        
        try {
            await addProject({
                name: String(fromJson.name || ''),
                description: String(fromJson.description || '')
            });
            onClose("submit");
        } catch (e) {
            onClose("error");
        }
    }
    return <>
        <Dialog className={'create-dialog'} open={open}  slotProps={{
            paper: {
                sx: {
                    background: 'var(--bg-surface)',
                    color: 'var(--text)',
                    '& .MuiDialogContextText-root': {
                        color: 'var(--text)'
                    },
                    '& .MuiInputBase-root': {
                        color: 'var(--text)'
                    },
                    '& .MuiInputLabel-root': {
                        color: 'var(--text-muted)'
                    },
                    '& .MuiOutlinedInput-root:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--text-muted)'
                    },
                }
            }
        }} >
            <DialogTitle>Create Project</DialogTitle>
            <Divider sx={{ borderColor: 'var(--text-muted)'}} />
            <DialogContent>
                <DialogContentText sx={{ color: 'var(--text)' }}>Create a new project</DialogContentText>
                <form className={"create-dialog-inputs"} id={"project-form"} onSubmit={HandleSubmit}>
                    <TextField required name={"name"} sx={{ borderColor: 'var(--text-muted)'}} label={"Project name"} />
                    <TextField required name={"description"} sx={{ borderColor: 'var(--text-muted)'}} multiline label={"Project description"} />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose('cancel')}>Cancel</Button>
                <Button type={"submit"} form={"project-form"}>Save</Button>
            </DialogActions>
        </Dialog>
    </>
}