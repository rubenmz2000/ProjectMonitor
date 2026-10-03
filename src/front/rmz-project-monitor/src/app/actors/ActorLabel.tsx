import type { Actor } from '../../models/ActorModel.ts';
import ActorMarker from './ActorMarker.tsx';
import './ActorLabel.css';

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
            <ActorMarker actor={actor} />
            <span className="rmz-actor-label__name">{actor.displayName}</span>
        </span>
    );
}

export default ActorLabel;
