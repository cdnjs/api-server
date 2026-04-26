import { type ComponentType, createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';

const parseIslandProps = <T>(root: Element): T | undefined => {
    const propsId = root.getAttribute('data-island-props');
    if (!propsId) {
        return undefined;
    }

    const propsScript = document.getElementById(propsId);
    if (!(propsScript instanceof HTMLScriptElement)) {
        return undefined;
    }

    try {
        return JSON.parse(propsScript.textContent ?? 'null') as T;
    } catch {
        return undefined;
    }
};

/**
 * Hydrate every server-rendered instance of an island by name.
 *
 * @param name Island name (maps to data attributes from Island wrapper).
 * @param component React island component to hydrate.
 */
const hydrateIsland = <T extends Record<string, unknown>>(
    name: string,
    component: ComponentType<T>,
) => {
    const selector = `[data-island="${name}"]`;

    for (const node of document.querySelectorAll(selector)) {
        if (!(node instanceof HTMLElement)) {
            continue;
        }

        const props = parseIslandProps<T>(node);
        if (props === undefined) {
            continue;
        }

        hydrateRoot(node, createElement(component, props));
    }
};

export default hydrateIsland;
