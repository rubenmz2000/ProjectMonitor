import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, CircularProgress, Alert, Box, Card, Select, MenuItem, FormControl, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getIssueByIdentifier, getActiveActors, updateAssignee } from '../../serivces/ApiService.ts';
import type { IssueDetailData } from '../../models/IssueDetailModel.ts';
import type { Actor } from '../../models/ActorModel.ts';
import IssueActivityPanel from '../../components/IssueActivity/IssueActivityPanel.tsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import './IssueDetail.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function IssueDetail() {
    const { issueIdentifier } = useParams<{ issueIdentifier: string }>();
    const navigate = useNavigate();
    const [issue, setIssue] = useState<IssueDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actors, setActors] = useState<Actor[]>([]);
    const [updatingAssignee, setUpdatingAssignee] = useState<boolean>(false);
    const [activityRefreshKey, setActivityRefreshKey] = useState(0);

    const fetchIssue = useCallback(async () => {
        if (!issueIdentifier) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getIssueByIdentifier(issueIdentifier);
            setIssue(data);
        } catch {
            setError('Failed to load issue');
            setIssue(null);
        } finally {
            setLoading(false);
        }
    }, [issueIdentifier]);

    useEffect(() => {
        fetchIssue();
        getActiveActors().then(setActors).catch(() => setActors([]));
    }, [fetchIssue]);

    const handleAssigneeChange = async (actorId: string) => {
        if (!issue || !issueIdentifier) return;
        
        const newAssigneeId = actorId === '' ? null : actorId;
        setUpdatingAssignee(true);
        try {
            const updated = await updateAssignee(issueIdentifier, newAssigneeId);
            setIssue(updated);
            setActivityRefreshKey((k) => k + 1);
        } catch {
            setError('Failed to update assignee');
        } finally {
            setUpdatingAssignee(false);
        }
    };

    return (
        <div className="issue-detail-container">
            <Button
                className="back-button"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
            >
                Back
            </Button>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                    <Button onClick={fetchIssue} sx={{ ml: 2 }} size="small" variant="outlined">
                        Retry
                    </Button>
                </Alert>
            ) : !issue ? (
                <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                    Issue not found.
                </Typography>
            ) : (
                <>
                    <Box className="detail-header">
                        <Typography variant="h4">
                            {issue.issueIdentifier}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {issue.projectName} ({issue.issuePrefix})
                        </Typography>
                    </Box>

                    <Card className="detail-card">
                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Title:</Typography>
                            <Typography component="span">{issue.title}</Typography>
                        </Box>

                        {issue.description && (
                            <Box className="detail-field">
                                <Typography className="detail-field-label" component="span">Description:</Typography>
                                <Typography className="description-text" variant="body2">
                                    {issue.description}
                                </Typography>
                            </Box>
                        )}

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Status:</Typography>
                            <Chip
                                label={issue.status}
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Priority:</Typography>
                            <Chip
                                label={issue.priority}
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Created by:</Typography>
                            <Box component="span" className="actor-display">
                                <Chip
                                    label={issue.createdBy.displayName}
                                    size="small"
                                    variant="outlined"
                                />
                                {issue.createdBy.kind === 'Agent' && (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        (Agent)
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Assignee:</Typography>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <Select
                                    value={issue.assignee?.id || ''}
                                    onChange={(e) => handleAssigneeChange(e.target.value)}
                                    disabled={updatingAssignee}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>Unassigned</em>
                                    </MenuItem>
                                    {actors.map((actor) => (
                                        <MenuItem key={actor.id} value={actor.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {actor.displayName}
                                                {actor.kind === 'Agent' && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        (Agent)
                                                    </Typography>
                                                )}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {updatingAssignee && (
                                <CircularProgress size={20} sx={{ ml: 2 }} />
                            )}
                        </Box>

                        {issue.dueDate && (
                            <Box className="detail-field">
                                <Typography className="detail-field-label" component="span">Due Date:</Typography>
                                <Typography component="span">
                                    {dayjs.utc(issue.dueDate).format('DD/MM/YYYY')}
                                </Typography>
                            </Box>
                        )}

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Created:</Typography>
                            <Typography component="span">
                                {dayjs.utc(issue.creationDate).local().fromNow()}
                            </Typography>
                        </Box>

                        {issue.updatedAt && (
                            <Box className="detail-field">
                                <Typography className="detail-field-label" component="span">Updated:</Typography>
                                <Typography component="span">
                                    {dayjs.utc(issue.updatedAt).local().fromNow()}
                                </Typography>
                            </Box>
                        )}
                    </Card>

                    <IssueActivityPanel issueIdentifier={issueIdentifier!} refreshKey={activityRefreshKey} />
                </>
            )}
        </div>
    );
}

export default IssueDetail;
