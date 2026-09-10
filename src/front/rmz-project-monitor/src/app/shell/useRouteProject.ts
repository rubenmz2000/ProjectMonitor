import { useContext } from 'react';
import { RouteProjectContext, type RouteProjectState } from './RouteProjectContext.ts';

/** The project the current route belongs to, resolved once by RouteProjectProvider. */
export function useRouteProject(): RouteProjectState {
    return useContext(RouteProjectContext);
}
