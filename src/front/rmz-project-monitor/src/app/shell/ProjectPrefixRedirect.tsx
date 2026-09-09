import { Navigate, useParams } from 'react-router-dom';

/** /projects/:prefix has no page of its own yet: send the user to the project's issues. */
function ProjectPrefixRedirect() {
    const { prefix } = useParams<{ prefix: string }>();
    return <Navigate to={`/projects/${prefix}/issues`} replace />;
}

export default ProjectPrefixRedirect;
