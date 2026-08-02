import { page } from 'vitest/browser';

/**
 * Open a website Worker route in a browser-test frame.
 *
 * @param path Website Worker route.
 */
export default async (path: string) => {
    const title = `Website output: ${path}`;
    const frame = document.createElement('iframe');
    frame.title = title;
    frame.src = `/__worker${path}`;
    const loaded = new Promise<void>((resolve, reject) => {
        frame.addEventListener('load', () => resolve(), { once: true });
        frame.addEventListener(
            'error',
            () => reject(new Error(`Unable to load ${path}.`)),
            { once: true },
        );
    });
    document.body.replaceChildren(frame);
    await loaded;

    return page.frameLocator(page.getByTitle(title));
};
