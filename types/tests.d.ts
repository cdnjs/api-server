declare module 'cloudflare:test' {
    interface ProvidedEnv extends Env {
        VITEST_EXTERNAL_API_URL?: string;
    }
}
