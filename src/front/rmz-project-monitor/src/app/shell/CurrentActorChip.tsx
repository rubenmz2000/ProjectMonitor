import { useEffect, useState } from 'react';
import { Avatar, Chip, Tooltip } from '@mui/material';
import type { Actor } from '../../models/ActorModel.ts';
import { getActiveActors } from '../../serivces/ApiService.ts';

/**
 * Shows who the application is acting as. The identity comes from VITE_ACTOR_IDENTIFIER
 * (the same value the API interceptor sends) until real authentication exists.
 */
function CurrentActorChip() {
    const identifier: string | undefined = import.meta.env.VITE_ACTOR_IDENTIFIER;
    // undefined = not looked up yet; null = looked up, not found
    const [actor, setActor] = useState<Actor | null | undefined>(identifier ? undefined : null);

    useEffect(() => {
        if (!identifier) return;
        let cancelled = false;
        getActiveActors()
            .then((actors) => { if (!cancelled) setActor(actors.find((a) => a.identifier === identifier) ?? null); })
            .catch(() => { if (!cancelled) setActor(null); });
        return () => { cancelled = true; };
    }, [identifier]);

    if (actor === undefined) return null;

    if (actor === null) {
        return (
            <Tooltip title={identifier ? `Actor "${identifier}" not found or inactive` : 'VITE_ACTOR_IDENTIFIER is not set'}>
                <Chip size="small" color="warning" variant="outlined" label={identifier ?? 'No actor'} />
            </Tooltip>
        );
    }

    return (
        <Tooltip title={`Acting as ${actor.displayName} (${actor.kind})`}>
            <Chip
                size="small"
                variant="outlined"
                avatar={<Avatar>{actor.displayName.charAt(0).toUpperCase()}</Avatar>}
                label={actor.kind === 'Agent' ? `${actor.displayName} · Agent` : actor.displayName}
            />
        </Tooltip>
    );
}

export default CurrentActorChip;
