import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, CircularProgress, Alert, Box, Card } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getIssueByTaskIdentifier } from '../../serivces/ApiService.ts';
import type { TaskDetailData } from '../../models/TaskDetailModel.ts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import './TaskDetail.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function TaskDetail() {
    const { taskIdentifier } = useParams<{ taskIdentifier: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTask = useCallback(async () => {
        if (!taskIdentifier) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getIssueByTaskIdentifier(taskIdentifier);
            setTask(data);
        } catch {
            setError('Failed to load task');
            setTask(null);
        } finally {
            setLoading(false);
        }
    }, [taskIdentifier]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    return (
        <div className="task-detail-container">
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
                    <Button onClick={fetchTask} sx={{ ml: 2 }} size="small" variant="outlined">
                        Retry
                    </Button>
                </Alert>
            ) : !task ? (
                <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                    Task not found.
                </Typography>
            ) : (
                <>
                    <Box className="detail-header">
                        <Typography variant="h4">
                            {task.taskIdentifier}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {task.projectName} ({task.taskPrefix})
                        </Typography>
                    </Box>

                    <Card className="detail-card">
                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Title:</Typography>
                            <Typography component="span">{task.title}</Typography>
                        </Box>

                        {task.description && (
                            <Box className="detail-field">
                                <Typography className="detail-field-label" component="span">Description:</Typography>
                                <Typography className="description-text" variant="body2">
                                    {task.description}
                                </Typography>
                            </Box>
                        )}

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Status:</Typography>
                            <Typography component="span">{task.status}</Typography>
                        </Box>

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Priority:</Typography>
                            <Typography component="span">{task.priority}</Typography>
                        </Box>

                        {task.dueDate && (
                            <Box className="detail-field">
                                <Typography className="detail-field-label" component="span">Due Date:</Typography>
                                <Typography component="span">
                                    {dayjs.utc(task.dueDate).format('DD/MM/YYYY')}
                                </Typography>
                            </Box>
                        )}

                        <Box className="detail-field">
                            <Typography className="detail-field-label" component="span">Created:</Typography>
                            <Typography component="span">
                                {dayjs.utc(task.creationDate).local().fromNow()}
                            </Typography>
                        </Box>

                        {task.updatedAt && (
                            <Box className="detail-field">
                                <Typography className="detail-field-label" component="span">Updated:</Typography>
                                <Typography component="span">
                                    {dayjs.utc(task.updatedAt).local().fromNow()}
                                </Typography>
                            </Box>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}

export default TaskDetail;
