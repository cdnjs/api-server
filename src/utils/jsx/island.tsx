import { type ComponentType, useId } from 'react';

const serializeProps = (props: object) =>
    JSON.stringify(props)
        .replaceAll('<', '\\u003c')
        .replaceAll('\u2028', '\\u2028')
        .replaceAll('\u2029', '\\u2029');

/**
 * Server helper for rendering an island with serialized props and entrypoint script.
 *
 * @param props Wrapper props.
 * @param props.name Island entrypoint name (maps to /islands/<name>.js).
 * @param props.component Component rendered server-side and hydrated client-side.
 * @param props.props Serializable props passed to the island component.
 */
const Island = <T extends object>({
    name,
    component: Component,
    props,
}: {
    name: string;
    component: ComponentType<T>;
    props: T;
}) => {
    const instanceId = useId().replaceAll(':', '');
    const propsScriptId = `island-props-${name}-${instanceId}`;

    return (
        <>
            <div data-island={name} data-island-props={propsScriptId}>
                <Component {...props} />
            </div>

            <script
                id={propsScriptId}
                type="application/json"
                dangerouslySetInnerHTML={{
                    __html: serializeProps(props),
                }}
            />

            <script type="module" src={`/islands/${name}.js`} />
        </>
    );
};

/**
 * Wrap a component as an island, associating it with a client entrypoint based on the file name, for server rendering.
 *
 * During the client entrypoint build, this wrapper is removed and replaced with the raw component.
 *
 * @param component Island component.
 * @param file Island file name (used to infer client entrypoint).
 */
const withIsland =
    <T extends object>(
        component: ComponentType<T>,
        file: `${string}.tsx`,
    ): ComponentType<T> =>
    (props: T) => (
        <Island
            name={file.replace(/\.tsx$/, '')}
            component={component}
            props={props}
        />
    );

export default withIsland;
