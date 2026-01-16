import type { WorkerManager } from '../services/WorkerManager';
import type { EmulatorState } from '../apple1/types/emulator-state';

export type AutoloadConfig = {
    stateUrl?: string;
    scriptUrl?: string;
    resetBeforeLoad: boolean;
    delayMs: number;
    afterText?: string;
};

const DEFAULT_DELAY_MS = 4;

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

const parseBool = (value: string | null): boolean =>
    value === '1' || value === 'true' || value === 'yes' || value === 'on';

const parseDelay = (value: string | null): number => {
    if (!value) return DEFAULT_DELAY_MS;
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return DEFAULT_DELAY_MS;
    return Math.max(0, Math.min(250, n));
};

const resolveUrl = (url: string): string => new URL(url, window.location.href).toString();

export const getAutoloadConfig = (search: string = window.location.search): AutoloadConfig | null => {
    const params = new URLSearchParams(search);

    const state = params.get('state');
    const load = params.get('load');

    if (!state && !load) return null;

    const cfg: AutoloadConfig = {
        resetBeforeLoad: parseBool(params.get('reset')),
        delayMs: parseDelay(params.get('delay')),
    };

    if (state) cfg.stateUrl = resolveUrl(state);
    if (load) cfg.scriptUrl = resolveUrl(load);

    const after = params.get('after');
    if (after && after.length > 0) {
        // URLSearchParams already decodes %0A etc.
        cfg.afterText = after;
    }

    return cfg;
};

const fetchText = async (url: string): Promise<string> => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Failed to fetch script: ${url} (HTTP ${res.status})`);
    }
    return await res.text();
};

const fetchState = async (url: string): Promise<EmulatorState> => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Failed to fetch state: ${url} (HTTP ${res.status})`);
    }
    return (await res.json()) as EmulatorState;
};

const injectTextAsKeys = async (
    workerManager: WorkerManager,
    text: string,
    delayMs: number,
): Promise<void> => {
    // Normalize: treat CRLF and CR as newline.
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        // Skip LF if we already handled CRLF as a single newline
        if (ch === '\n' && i > 0 && text[i - 1] === '\r') {
            continue;
        }

        if (ch === '\n' || ch === '\r') {
            await workerManager.keyDown('Enter');
        } else if (ch === '\t') {
            await workerManager.keyDown('Tab');
        } else if (ch === '\b') {
            await workerManager.keyDown('Backspace');
        } else if (ch === '\u001b') {
            await workerManager.keyDown('Escape');
        } else {
            // WebKeyboard uppercases single-char keys automatically.
            await workerManager.keyDown(ch);
        }

        if (delayMs > 0) {
            await sleep(delayMs);
        }
    }
};

export const runAutoload = async (workerManager: WorkerManager, cfg: AutoloadConfig): Promise<void> => {
    if (cfg.resetBeforeLoad) {
        await workerManager.keyDown('Tab');
        // Give the emulation loop a breath after reset.
        await sleep(25);
    }

    if (cfg.stateUrl) {
        const state = await fetchState(cfg.stateUrl);
        await workerManager.loadState(state);
        // After state load the worker restarts the loop; a short delay helps UI settle.
        await sleep(25);
    }

    if (cfg.scriptUrl) {
        const script = await fetchText(cfg.scriptUrl);
        await injectTextAsKeys(workerManager, script, cfg.delayMs);
    }

    if (cfg.afterText) {
        await injectTextAsKeys(workerManager, cfg.afterText, cfg.delayMs);
    }
};
