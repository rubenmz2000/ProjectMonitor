import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import type { Actor } from '../../models/ActorModel.ts';
import './ActorLabel.css';

function initials(displayName: string): string {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
}

/**
 * Compact representation of an actor: a small marker (initials for humans, an agent glyph for
 * agents) and the display name. A null actor renders as "Unassigned".
 */
function ActorLabel({ actor }: { actor: Actor | null }) {
    if (!actor) {
        return <span className="rmz-actor-label rmz-actor-label--empty">Unassigned</span>;
    }
    const isAgent = actor.kind === 'Agent';
    return (
        <span className="rmz-actor-label" title={isAgent ? `${actor.displayName} (agent)` : actor.displayName}>
            <span className={`rmz-actor-label__marker${isAgent ? ' rmz-actor-label__marker--agent' : ''}`} aria-hidden>
                {isAgent ? <SmartToyOutlinedIcon /> : initials(actor.displayName)}
            </span>
            <span className="rmz-actor-label__name">{actor.displayName}</span>
        </span>
    );
}

export default ActorLabel;
