import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import type { Actor } from '../../models/ActorModel.ts';
import './ActorLabel.css';

function initials(displayName: string): string {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
}

/** Small round marker for an actor: initials for humans, an agent glyph for agents. */
function ActorMarker({ actor }: { actor: Actor }) {
    const isAgent = actor.kind === 'Agent';
    return (
        <span className={`rmz-actor-label__marker${isAgent ? ' rmz-actor-label__marker--agent' : ''}`} aria-hidden>
            {isAgent ? <SmartToyOutlinedIcon /> : initials(actor.displayName)}
        </span>
    );
}

export default ActorMarker;
