import { env } from 'cloudflare:workers';
import { type ComponentType, createContext, useContext, useId } from 'react';
import * as z from 'zod';

const manifestSchema = z.record(
    z.string(),
    z.object({
        file: z.string(),
    }),
);

type Manifest = z.infer<typeof manifestSchema>;

const IslandContext = createContext<{ manifest: Manifest } | null>(null);

/**
 * Loads the entry manifest for client islands and returns a context provider to supply it to server-rendered islands.
 */
export const createIslandProvider = async () => {
    const response = await env.ASSETS.fetch(
        'https://assets.local/islands/manifest.json',
    );
    if (!response.ok) {
        throw new Error(
            `Failed to load island manifest: ${response.status} ${response.statusText}`,
        );
    }
    const manifest = manifestSchema.parse(await response.json());

    /**
     * Server helper for providing the entry manifest to server-rendered client islands via context.
     *
     * @param props Wrapper props.
     * @param props.children Children to be rendered within the provider to access the context.
     */
    return ({ children }: { children: React.ReactNode }) => (
        <IslandContext.Provider value={{ manifest }}>
            {children}
        </IslandContext.Provider>
    );
};

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

    const { manifest } = useContext(IslandContext) ?? {};
    if (!manifest) {
        throw new Error(
            'Island component must be rendered within an IslandProvider',
        );
    }

    const entry = manifest[`virtual:island-entry:${name}`];
    if (!entry) {
        throw new Error(`Missing manifest entry for island "${name}"`);
    }

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

            <script type="module" src={`/${entry.file}`} />
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
