import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { createIssue } from '../../../serivces/ApiService.ts';

export default function CreateIssueDialog({
    open,
    projectId,
    issuePrefix,
    onClose
}: {
    open: boolean,
    projectId: string,
    issuePrefix: string,
    onClose: (result: string, issueIdentifier?: string) => void
}) {
    const HandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const issueData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority') || 'Medium',
            dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string).toISOString() : null
        };

        try {
            const createdIssue = await createIssue(projectId, issueData);
            onClose("submit", createdIssue.issueIdentifier);
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
            <DialogTitle>Create Issue</DialogTitle>
            <Divider sx={{ borderColor: 'var(--text-muted)' }} />
            <DialogContent>
                <DialogContentText sx={{ color: 'var(--text)', mb: 2 }}>
                    Create a new issue for project {issuePrefix}
                </DialogContentText>
                <form id="issue-form" onSubmit={HandleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <Button type="submit" form="issue-form" variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    </>
}
