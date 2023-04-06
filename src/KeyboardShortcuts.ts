import ScreenManager from "./ScreenManager";

class KeyboardShortcuts {
    /**
     * Instance of KeyboardShortcuts
     */
    private static instance: KeyboardShortcuts;

    /**
     * Constructor
     */
    private constructor() {};

    /**
     * Get instance of KeyboardShortcuts
     */
    public static getInstance(): KeyboardShortcuts {
        return this.instance ??= new KeyboardShortcuts();
    }

    /**
     * List of registered shortcuts
     */
    private readonly shortcuts: KeyboardShortcuts.Shortcut[] = [];

    /**
     * Register a keyboard shortcut
     * @param keys Array of keyboard combinations, e.g. [["ctrl", "s"], ["ctrl", "shift", "s"]]
     * @param action Function executed when keys are pressed
     * @param description Description of the shortcut (shown to the user)
     * @param [screen] If specified, the shortcut is only active when this screen is open
     */
    public register(keys: (keyof typeof KeyboardShortcuts.Shortcut.keyCodes)[][], action: () => any, description: string, screen?: string): void {
        if (this.getShortcutsForScreen(screen).some(s => s.keys.every((k, i) => k === keys[i]))) return;
        this.shortcuts.push(new KeyboardShortcuts.Shortcut(keys, action, description, screen));
    }

    /**
     * Get all shortcuts for a screen (incl. global shortcuts)
     */
    private getShortcutsForScreen(screen?: string): KeyboardShortcuts.Shortcut[] {
        return this.shortcuts.filter(s => [screen, undefined].includes(s.screen));
    }

    /**
     * Handle keyboard event
     * @param event Keyboard event
     */
    public handleKeyboardEvent(event: KeyboardEvent): void {
        const shortcuts = this.getShortcutsForScreen(ScreenManager.getInstance().getOpenScreen()?.id);
        for (const shortcut of shortcuts) shortcut.triggerIfMatch(event);
    }
}

namespace KeyboardShortcuts {
    /**
     * A keyboard shortcut
     */
    export class Shortcut {
        /**
         * A map from user-friendly key id to key code
         */
        public static readonly keyCodes = {
            backspace: "Backspace",
            tab: "Tab",
            enter: "Enter",
            shift: "ShiftLeft",
            shiftr: "ShiftRight",
            ctrl: "ControlLeft",
            ctrlr: "ControlRight",
            alt: "AltLeft",
            altr: "AltRight",
            esc: "Escape",
            pageup: "PageUp",
            pagedown: "PageDown",
            end: "End",
            home: "Home",
            left: "ArrowLeft",
            up: "ArrowUp",
            right: "ArrowRight",
            down: "ArrowDown",
            del: "Delete",
            "0": "Digit0",
            "1": "Digit1",
            "2": "Digit2",
            "3": "Digit3",
            "4": "Digit4",
            "5": "Digit5",
            "6": "Digit6",
            "7": "Digit7",
            "8": "Digit8",
            "9": "Digit9",
            ";": "Semicolon",
            "=": "Equal",
            a: "KeyA",
            b: "KeyB",
            c: "KeyC",
            d: "KeyD",
            e: "KeyE",
            f: "KeyF",
            g: "KeyG",
            h: "KeyH",
            i: "KeyI",
            j: "KeyJ",
            k: "KeyK",
            l: "KeyL",
            m: "KeyM",
            n: "KeyN",
            o: "KeyO",
            p: "KeyP",
            q: "KeyQ",
            r: "KeyR",
            s: "KeyS",
            t: "KeyT",
            u: "KeyU",
            v: "KeyV",
            w: "KeyW",
            x: "KeyX",
            y: "KeyY",
            z: "KeyZ",
            f1: "F1",
            f2: "F2",
            f3: "F3",
            f4: "F4",
            f5: "F5",
            f6: "F6",
            f7: "F7",
            f8: "F8",
            f9: "F9",
            f10: "F10",
            f11: "F11",
            f12: "F12",
            f13: "F13",
            "[": "BracketLeft",
            "]": "BracketRight",
            "'": "Quote",
            "\\": "Backslash",
            ",": "Comma",
            ".": "Period",
            "/": "Slash",
        } as const;

        /**
         * Create shortcut
         * @param keys Array of keyboard combinations, e.g. [["ctrl", "s"], ["ctrl", "shift", "s"]]
         * @param action Function executed when keys are pressed
         * @param description Description of the shortcut (shown to the user)
         * @param [screen] If specified, the shortcut is only active when this screen is open
         */
        constructor(
            public readonly keys: (keyof typeof KeyboardShortcuts.Shortcut.keyCodes)[][],
            private readonly action: () => any,
            public readonly description: string,
            public readonly screen?: string
        ) {}

        /**
         * Check if a keyboard event triggers any of the shortcut's keys
         * @param event Keyboard event
         */
        private matches(event: KeyboardEvent): boolean {
            return this.keys.some(set => {
                const specialKeys = {
                    alt: set.includes("alt"),
                    ctrl: set.includes("ctrl"),
                    shift: set.includes("shift"),
                } as const;
                const key = set.filter(k => !Object.keys(specialKeys).includes(k))[0];
                if (!key) return false;
                const keyCode = KeyboardShortcuts.Shortcut.keyCodes[key];
                return event.code === keyCode && event.altKey === specialKeys.alt && event.ctrlKey === specialKeys.ctrl && event.shiftKey === specialKeys.shift;
            });
        }

        /**
         * Trigger the shortcut's action if the keyboard event matches
         * @param event Keyboard event
         */
        public triggerIfMatch(event: KeyboardEvent): void {
            if (this.matches(event)) this.action();
        }

    }
}

export default KeyboardShortcuts;