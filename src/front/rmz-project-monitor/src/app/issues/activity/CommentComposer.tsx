import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import type { Actor } from '../../../models/ActorModel.ts';
import ActorLabel from '../../actors/ActorLabel.tsx';
import './IssueActivity.css';

interface CommentComposerProps {
    /** Who the comment will be attributed to, when known. */
    currentActor: Actor | null;
    /** Resolves to true when the comment was saved; the text is kept otherwise. */
    onSubmit: (body: string) => Promise<boolean>;
}

/** Adds a comment to the activity of an issue. Ctrl/Cmd+Enter sends it. */
function CommentComposer({ currentActor, onSubmit }: CommentComposerProps) {
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const canSubmit = body.trim() !== '' && !submitting;

    const submit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        const saved = await onSubmit(body.trim());
        setSubmitting(false);
        if (saved) setBody('');
    };

    return (
        <form
            className="rmz-comment-composer"
            onSubmit={(e) => { e.preventDefault(); submit(); }}
        >
            <TextField
                name="comment"
                placeholder="Write a comment…"
                multiline
                minRows={3}
                fullWidth
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        submit();
                    }
                }}
                disabled={submitting}
            />
            <div className="rmz-comment-composer__footer">
                <span className="rmz-comment-composer__as">
                    {currentActor && <>Commenting as <ActorLabel actor={currentActor} /></>}
                </span>
                <span className="rmz-comment-composer__actions">
                    <span className="rmz-comment-composer__hint">Ctrl+Enter</span>
                    <Button type="submit" variant="contained" disabled={!canSubmit}>
                        Comment
                    </Button>
                </span>
            </div>
        </form>
    );
}

export default CommentComposer;
