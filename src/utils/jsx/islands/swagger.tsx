import { css } from '@emotion/css';
import { Iterable, List, Map } from 'immutable';
import { type ComponentType, type ReactNode, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import swaggerStyles from 'swagger-ui-react/swagger-ui.css';

import theme from '../../theme.ts';
import createIsland from '../island.tsx';

const mixins = {
    pre: css`
        background: ${theme.background.footer} !important;
        color: ${theme.text.primary};
        padding: ${theme.spacing(1.5, 2)} !important;
        border-radius: ${theme.radius};
        font-size: ${theme.font.small.size};
        margin: 0;
        display: block;
        width: 100%;
        box-sizing: border-box;
        max-height: ${theme.spacing(50)};
        overflow: auto;
    `,
    code: css`
        background: ${theme.background.body};
        color: ${theme.text.primary};
        padding: ${theme.spacing(0.25, 0.75)};
        border-radius: ${theme.radius};
        font-size: ${theme.font.small.size};
    `,
    body: css`
        padding: ${theme.spacing(1.5, 2)};
    `,
};

const styles = {
    container: css`
        .swagger-ui {
            pre {
                ${mixins.pre};
            }

            code:not(pre code) {
                ${mixins.code};
            }

            svg {
                fill: currentColor;
            }

            button {
                color: inherit;
            }

            a {
                color: ${theme.text.brand};
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }

            /* Remove the default styling of operation sections. */
            .opblock {
                margin: 0;
                border: 0;
                border-radius: 0;
                background: none;
                box-shadow: none;
            }

            /* Replace the default background of operation section headers. */
            .opblock .opblock-section-header {
                background: ${theme.background.footer};
                box-shadow: none;
                border-radius: ${theme.radius};
            }

            /* Add a consistent indicator to the "Parameters" + "Responses" tabs. */
            .opblock .opblock-section-header .tab-item h4 span,
            .opblock .responses-wrapper .opblock-section-header h4 {
                position: relative;
                display: inline-block;
                width: fit-content;
                flex: 0 0 auto;

                &::after {
                    content: '';
                    display: block;
                    position: static;
                    transform: none;
                    width: 100%;
                    height: ${theme.spacing(0.5)};
                    background: ${theme.background.brand};
                    margin-top: ${theme.spacing(0.5)};
                    bottom: auto;
                    left: auto;
                }
            }

            /* Present the "Execute" + "Clear" buttons in a single line. */
            .opblock .execute-wrapper,
            .opblock .btn-group {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: ${theme.spacing(1)};
                padding: ${theme.spacing(1.5, 2)};
            }
            .opblock .btn.execute {
                flex: 1 1 auto;
                padding: ${theme.spacing(1, 2)};
                font-size: ${theme.font.body.size};
                font-weight: 600;
                background: ${theme.background.brand};
                border-color: ${theme.background.brand};
                color: ${theme.text.inverted};
                box-shadow: none;
                text-shadow: none;
            }
            .opblock .btn-clear {
                flex: 0 0 auto;
                padding: ${theme.spacing(1, 2)};
                font-size: ${theme.font.body.size};
                font-weight: 600;
                color: inherit;
            }

            /* Remove the duplicate model title from standalone schemas. */
            section.models .model-box-control:has(.model-title) {
                display: none;
            }

            /* Replace the default SVG with +/- for the toggles in models. */
            .model-toggle {
                transform: none;
                vertical-align: middle;
                top: 0;

                &::after {
                    content: '+';
                    background: none;
                    width: auto;
                    height: auto;
                    display: inline-block;
                    font-family: monospace;
                    font-size: ${theme.font.small.size};
                    font-weight: ${theme.font.small.weight};
                    line-height: 1;
                    vertical-align: middle;
                    color: ${theme.text.secondary};
                }
            }
            [aria-expanded='true'] > .model-toggle {
                &::after {
                    content: '-';
                }
            }

            /* Make the response schema models match the example value code. */
            .model {
                font-size: ${theme.font.small.size};
            }
            .model-example .model-box {
                ${mixins.pre};
            }

            /* Remove the default links column from the responses table. */
            .responses-table .response-col_links {
                display: none;
            }
        }
    `,
    wrapper: css`
        display: block;
        border: ${theme.spacing(0.125)} solid ${theme.background.body};
        border-radius: ${theme.radius};
        background: ${theme.background.navigation};
        margin: 0 0 ${theme.spacing(1.5)};
        overflow: hidden;
    `,
    summary: css`
        ${mixins.body};
        display: flex;
        align-items: center;
        gap: ${theme.spacing(1.5)};
        background: ${theme.background.footer};
        cursor: pointer;

        > span:first-child {
            ${mixins.code};
            font-weight: bold;
        }

        > svg:last-child {
            margin-left: auto;
            flex-shrink: 0;
        }
    `,
    header: css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(1)};
        font-size: ${theme.font.large.size};
        font-weight: bold;
        padding: ${theme.spacing(1.25, 2, 1.25, 1.25)};
        margin: 0 0 ${theme.spacing(0.625)};
        cursor: pointer;
        color: inherit;

        > svg:last-child {
            margin-left: auto;
            flex-shrink: 0;
        }
    `,
    loader: css`
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity ${theme.transition};
        transition-delay: 0.5s;

        @starting-style {
            opacity: 0;
        }
    `,
};

interface System {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getComponent: (name: string, container?: boolean) => ComponentType<any>;
    getConfigs: () => Record<string, unknown>;
    layoutSelectors: {
        isShown: (key: readonly string[], def: boolean) => boolean;
    };
    layoutActions: {
        show: (key: readonly string[], shown: boolean) => void;
    };
    specSelectors: {
        isOAS3: () => boolean;
        definitions: () => Map<string, unknown>;
    };
}

/**
 * Custom wrapper component for all collapsible sections of the Swagger UI.
 *
 * @param props Component props.
 * @param props.children Content to display inside the wrapper.
 */
const Wrapper = ({ children }: { children: ReactNode }) => (
    <div className={styles.wrapper}>{children}</div>
);

/**
 * Custom summary component for operations and standalone schemas.
 *
 * @param props Component props.
 * @param props.system Swagger UI system object passed to all components.
 * @param props.onClick Handler to toggle the section expansion.
 * @param props.expanded Whether the section is currently expanded.
 * @param props.badge Text to show in the badge before the summary content.
 * @param props.children Summary content to display.
 */
const Summary = ({
    system,
    onClick,
    badge,
    expanded,
    children,
}: {
    system: System;
    onClick: () => void;
    expanded: boolean;
    badge: ReactNode;
    children: ReactNode;
}) => {
    const ArrowIcon = system.getComponent(
        expanded ? 'ArrowUpIcon' : 'ArrowDownIcon',
    );

    return (
        <div className={styles.summary} onClick={onClick}>
            <span>{badge}</span>
            {children}
            <ArrowIcon />
        </div>
    );
};

/**
 * Custom header component for collapsible sections of the Swagger UI.
 *
 * @param props Component props.
 * @param props.system Swagger UI system object passed to all components.
 * @param props.onClick Handler to toggle the section expansion.
 * @param props.expanded Whether the section is currently expanded.
 * @param props.children Header content to display.
 */
const Header = ({
    system,
    onClick,
    expanded,
    children,
}: {
    system: System;
    onClick: () => void;
    expanded: boolean;
    children: ReactNode;
}) => {
    const ArrowIcon = system.getComponent(
        expanded ? 'ArrowUpIcon' : 'ArrowDownIcon',
    );

    return (
        <h3 className={styles.header} onClick={onClick}>
            <span>{children}</span>
            <ArrowIcon />
        </h3>
    );
};

const plugin = (system: System) => ({
    components: {
        /**
         * Replace the default layout with a custom implementation that only
         *  renders the operations and schema models, omitting other sections.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/components/layouts/base.jsx
         */
        BaseLayout: () => {
            const SvgAssets = system.getComponent('SvgAssets');
            const Operations = system.getComponent('operations', true);
            const Models = system.getComponent('Models', true);

            return (
                <div className="swagger-ui">
                    <SvgAssets />
                    <Operations />
                    <Models />
                </div>
            );
        },
        /**
         * Replace the default operation tag section with a custom implementation
         *  that uses our custom `Header`.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/components/operation-tag.jsx
         *
         * @param props Props passed by swagger-ui.
         * @param props.tag Name of the tag this section represents.
         * @param props.children Operations grouped under this tag.
         */
        OperationTag: ({
            tag,
            children,
        }: {
            tag: string;
            children: ReactNode;
        }) => {
            const { docExpansion } = system.getConfigs();
            const isShownKey = ['operations-tag', tag];
            const expanded = system.layoutSelectors.isShown(
                isShownKey,
                docExpansion === 'full' || docExpansion === 'list',
            );
            const Collapse = system.getComponent('Collapse');
            const onClick = () =>
                system.layoutActions.show(isShownKey, !expanded);
            const label = tag.charAt(0).toUpperCase() + tag.slice(1);

            return (
                <div
                    className={
                        expanded
                            ? 'opblock-tag-section is-open'
                            : 'opblock-tag-section'
                    }
                >
                    <Header
                        system={system}
                        onClick={onClick}
                        expanded={expanded}
                    >
                        {label}
                    </Header>
                    <Collapse isOpened={expanded}>{children}</Collapse>
                </div>
            );
        },
        /**
         * Replace the default operation summary with our custom `Summary`.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/components/operation-summary.jsx
         *
         * @param props Props passed by swagger-ui.
         * @param props.isShown Whether the operation body is currently expanded.
         * @param props.toggleShown Handler to toggle the operation body expansion.
         * @param props.operationProps Iterable of the operation's properties.
         */
        OperationSummary: ({
            isShown,
            toggleShown,
            operationProps,
        }: {
            isShown: boolean;
            toggleShown: () => void;
            operationProps: Iterable<string, unknown>;
        }) => {
            const { method, path, summary } = operationProps.toObject();
            if (
                typeof method !== 'string' ||
                typeof path !== 'string' ||
                (typeof summary !== 'undefined' && typeof summary !== 'string')
            ) {
                throw new Error('Invalid operationProps for OperationSummary');
            }

            return (
                <Summary
                    system={system}
                    badge={method?.toUpperCase()}
                    onClick={toggleShown}
                    expanded={isShown}
                >
                    <code>
                        {path?.split(/\//g).map((part, i) =>
                            i === 0 ? (
                                part
                            ) : (
                                <>
                                    <wbr key={`wbr-${i}`} />/{part}
                                </>
                            ),
                        )}
                    </code>
                    <span>{summary}</span>
                </Summary>
            );
        },
        /**
         * Remove the default "Try it out" button as we always enable it.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/components/try-it-out-button.jsx
         */
        TryItOutButton: () => null,
        /**
         * Replace the default models section with a custom implementation
         *  that uses our custom `Header` + `Wrapper` + `Summary`.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/plugins/json-schema-5/components/models.jsx
         */
        Models: () => {
            const { docExpansion, defaultModelsExpandDepth = 1 } =
                system.getConfigs();
            const definitions = system.specSelectors.definitions();
            if (!definitions.size || Number(defaultModelsExpandDepth) < 0)
                return null;

            const specPathBase = system.specSelectors.isOAS3()
                ? ['components', 'schemas']
                : ['definitions'];

            const sectionExpanded = system.layoutSelectors.isShown(
                specPathBase,
                Number(defaultModelsExpandDepth) > 0 && docExpansion !== 'none',
            );
            const onSectionClick = () =>
                system.layoutActions.show(specPathBase, !sectionExpanded);

            const Collapse = system.getComponent('Collapse');

            return (
                <section
                    className={sectionExpanded ? 'models is-open' : 'models'}
                >
                    <Header
                        system={system}
                        onClick={onSectionClick}
                        expanded={sectionExpanded}
                    >
                        Schemas
                    </Header>
                    <Collapse isOpened={sectionExpanded}>
                        {definitions
                            .entrySeq()
                            .map((entry) => {
                                if (!entry) return null;

                                const [name, schema] = entry;
                                const fullPath = [...specPathBase, name];
                                const expanded = system.layoutSelectors.isShown(
                                    fullPath,
                                    false,
                                );
                                const onClick = () =>
                                    system.layoutActions.show(
                                        fullPath,
                                        !expanded,
                                    );
                                const ModelWrapper =
                                    system.getComponent('ModelWrapper');

                                return (
                                    <Wrapper>
                                        <Summary
                                            system={system}
                                            badge="SCHEMA"
                                            onClick={onClick}
                                            expanded={expanded}
                                        >
                                            <code>{name}</code>
                                        </Summary>
                                        {expanded && (
                                            <div className={mixins.body}>
                                                <ModelWrapper
                                                    name={name}
                                                    displayName={name}
                                                    schema={schema}
                                                    fullPath={fullPath}
                                                    specPath={List(fullPath)}
                                                    getComponent={
                                                        system.getComponent
                                                    }
                                                    getConfigs={
                                                        system.getConfigs
                                                    }
                                                    specSelectors={
                                                        system.specSelectors
                                                    }
                                                    layoutSelectors={
                                                        system.layoutSelectors
                                                    }
                                                    layoutActions={
                                                        system.layoutActions
                                                    }
                                                    includeReadOnly
                                                    includeWriteOnly
                                                />
                                            </div>
                                        )}
                                    </Wrapper>
                                );
                            })
                            .toArray()}
                    </Collapse>
                </section>
            );
        },
        /**
         * Replace the default enum model rendering with a single line of text.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/plugins/json-schema-5/components/enum-model.jsx
         *
         * @param props Props passed by swagger-ui.
         * @param props.value Enum values to render.
         */
        EnumModel: ({ value }: { value: Iterable<string, unknown> }) => (
            <span className="prop-enum">
                Enum: [ {value.map(String).join(', ')} ]
            </span>
        ),
    },
    wrapComponents: {
        /**
         * Wrap model rendering to force all properties to expand by default.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/plugins/json-schema-5/components/model.jsx
         *
         * @param Original Original model component to wrap.
         */
        Model:
            (Original: ComponentType<Record<string, unknown>>) =>
            (props: Record<string, unknown>) => (
                <Original {...props} expandDepth={Infinity} />
            ),
        /**
         * Wrap the entire operation with our custom `Wrapper`, matching the
         *  wrapper we apply in `Models` for standalone schemas.
         *
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/containers/OperationContainer.jsx
         * @see https://github.com/swagger-api/swagger-ui/blob/v5.32.5/src/core/components/operation.jsx
         *
         * @param Original Original operation component to wrap.
         */
        operation:
            (Original: ComponentType<Record<string, unknown>>) =>
            (props: Record<string, unknown>) => (
                <Wrapper>
                    <Original {...props} />
                </Wrapper>
            ),
    },
});

const scopedSwaggerStyles = swaggerStyles
    .replace(/(?<=[{;]\s*)color:\s*[^;]+;/g, '')
    .replace(/\.swagger-ui(?![\w-])/g, `.${styles.container} .swagger-ui`);

/**
 * Custom Swagger UI island component to render the OpenAPI spec for the API documentation page.
 *
 * @param props Component props.
 * @param props.spec OpenAPI specification to render.
 */
const Swagger = ({ spec }: { spec: object }) => {
    const [loading, setLoading] = useState(true);

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `@layer { ${scopedSwaggerStyles} }`,
                }}
            />
            <div className={styles.container}>
                <SwaggerUI
                    spec={spec}
                    onComplete={() => setLoading(false)}
                    plugins={[plugin]}
                    supportedSubmitMethods={['get']}
                    tryItOutEnabled
                    displayRequestDuration
                />
            </div>
            {loading && (
                <div className={styles.loader}>
                    Loading OpenAPI specification...
                </div>
            )}
        </>
    );
};

export default createIsland(Swagger, 'swagger.tsx');
