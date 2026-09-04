import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { createTask } from '../../../serivces/ApiService.ts';

export default function CreateTaskDialog({
    open, 
    projectId,
    taskPrefix,
    onClose
}: {
    open: boolean, 
    projectId: string,
    taskPrefix: string,
    onClose: (result: string, taskIdentifier?: string) => void
}) {
    const HandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority') || 'Medium',
            dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string).toISOString() : null
        };
        
        try {
            const createdTask = await createTask(projectId, taskData);
            onClose("submit", createdTask.taskIdentifier);
        } catch (e) {
            onClose("error");
        }
    }

    return <>
        <Dialog open={open} slotProps={{
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
        }} maxWidth="sm" fullWidth>
            <DialogTitle>Create Task</DialogTitle>
            <Divider sx={{ borderColor: 'var(--text-muted)' }} />
            <DialogContent>
                <DialogContentText sx={{ color: 'var(--text)', mb: 2 }}>
                    Create a new task for project {taskPrefix}
                </DialogContentText>
                <form id="task-form" onSubmit={HandleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextField 
                        required 
                        name="title" 
                        label="Title" 
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                    />
                    <TextField 
                        required 
                        name="description" 
                        label="Description" 
                        multiline 
                        rows={3}
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 300 } }}
                    />
                    <TextField
                        select
                        name="priority"
                        label="Priority"
                        defaultValue="Medium"
                        fullWidth
                    >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Critical">Critical</MenuItem>
                    </TextField>
                    <TextField
                        name="dueDate"
                        label="Due Date (optional)"
                        type="date"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose('cancel')}>Cancel</Button>
                <Button type="submit" form="task-form" variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    </>
}
