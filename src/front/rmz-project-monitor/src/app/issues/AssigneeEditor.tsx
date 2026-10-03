import { useState } from 'react';
import { Button, List, ListItemButton, Popover, TextField } from '@mui/material';
import type { Actor } from '../../models/ActorModel.ts';
import ActorLabel from '../actors/ActorLabel.tsx';
import './AssigneeEditor.css';

interface AssigneeEditorProps {
    current: Actor | null;
    /** Active actors that can be assigned. */
    actors: Actor[];
    /** Resolves to true when the change was saved; the popover stays open otherwise. */
    onAssign: (assigneeId: string | null, note: string) => Promise<boolean>;
}

/**
 * "Change" control for the assignee: pick an actor (or Unassigned) and optionally leave a note,
 * which is recorded with the change in the issue activity.
 */
function AssigneeEditor({ current, actors, onAssign }: AssigneeEditorProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const currentId = current?.id ?? null;

    const open = (element: HTMLElement) => {
        setSelected(currentId);
        setNote('');
        setAnchor(element);
    };

    const close = () => {
        if (!saving) setAnchor(null);
    };

    const submit = async () => {
        setSaving(true);
        const saved = await onAssign(selected, note.trim());
        setSaving(false);
        if (saved) setAnchor(null);
    };

    const options: (Actor | null)[] = [null, ...actors];

    return (
        <>
            <Button size="small" onClick={(e) => open(e.currentTarget)}>Change</Button>
            <Popover
                open={anchor !== null}
                anchorEl={anchor}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <div className="rmz-assignee-editor">
                    <div className="rmz-assignee-editor__title">Assign to</div>
                    <List dense disablePadding className="rmz-assignee-editor__options">
                        {options.map((actor) => {
                            const id = actor?.id ?? null;
                            return (
                                <ListItemButton
                                    key={id ?? 'unassigned'}
                                    selected={selected === id}
                                    onClick={() => setSelected(id)}
                                    disabled={saving}
                                >
                                    <ActorLabel actor={actor} />
                                    {id === currentId && <span className="rmz-assignee-editor__current">current</span>}
                                </ListItemButton>
                            );
                        })}
                    </List>
                    <TextField
                        size="small"
                        label="Note (optional)"
                        helperText="Recorded in the activity with the change"
                        multiline
                        minRows={2}
                        fullWidth
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={saving}
                    />
                    <div className="rmz-assignee-editor__actions">
                        <Button size="small" onClick={close} disabled={saving}>Cancel</Button>
                        <Button size="small" variant="contained" onClick={submit} disabled={saving || selected === currentId}>
                            Assign
                        </Button>
                    </div>
                </div>
            </Popover>
        </>
    );
}

export default AssigneeEditor;
