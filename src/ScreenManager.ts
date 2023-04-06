class ScreenManager {
    /**
     * Screen manager instance
     */
    private static instance: ScreenManager | null = null;

    /**
     * Get screen manager instance
     */
    public static getInstance(): ScreenManager {
        return this.instance ??= new ScreenManager();
    }

    /**
     * Application screens
     */
    private readonly screens: Record<string, ScreenManager.Screen> = {};

    /**
     * Open screen
     * @param id Screen ID
     * @param params Screen render parameters
     */
    public async open(id: string, params?: any): Promise<void> {
        if (!this.screens[id]) throw new Error(`ScreenManager: ${id}: enoent`);
        await this.screens[id]!.open(params);
    }

    /**
     * Get currently open screen
     */
    public getOpenScreen(): ScreenManager.Screen | null {
        return Object.values(this.screens).find(s => s.isOpen) ?? null;
    }

    /**
     * Create screen
     * @param id Screen ID
     * @param title Screen title
     * @param ephemeral If true, the screen is destroyed when closed
     * @param renderer Screen render function
     */
    public createScreen(id: string, title: string, ephemeral: boolean, renderer: (this: ScreenManager.Screen, params: any) => Promise<void>): void {
        if (this.screens[id]) throw new Error(`ScreenManager: ${id}: already exists`);
        this.screens[id] = new ScreenManager.Screen(id, title, ephemeral, renderer);
    }

    private constructor() {};

    /**
     * Create or get screens container
     */
    public getContainer(): HTMLDivElement {
        const existingContainer = document.getElementById("screens") as HTMLDivElement | null;
        if (existingContainer) return existingContainer;

        const container = document.createElement("div");
        container.id = "screens";
        document.body.appendChild(container);
        return container;
    }

    /**
     * Close all screens
     */
    public closeAll(): void {
        Object.entries(this.screens).forEach(([_, screen]) => screen.close());
    }
}

namespace ScreenManager {
    /**
     * Application screen
     */
    export class Screen {
        /**
         * Whether the screen is open
         */
        #open: boolean = false;

        /**
         * Whether the screen is open
         */
        public get isOpen(): boolean {
            return this.#open;
        }

        /**
         * Screen DOM element
         */
        #container: HTMLElement | null = null;

        /**
         * Screen DOM element
         */
        public get container(): HTMLElement {
            if (!this.#container) throw new Error(`ScreenManager: ${this.id}: container not initialised`);
            return this.#container;
        }

        /**
         * @param id Screen ID
         * @param title Screen title
         * @param ephemeral If true, the screen is destroyed when closed
         * @param renderer Screen render function
         */
        public constructor(public readonly id: string, private readonly title: string, private readonly ephemeral: boolean, private readonly renderer: (this: Screen, params?: any) => Promise<void>) {
            this.initContainer();
        }

        /**
         * Create container
         */
        private initContainer(): void {
            this.#container = document.createElement("main");
            this.container.classList.add("min-h-screen", "bg-neutral-950", "select-none");
            this.container.dataset.screenEphemeral = this.ephemeral.toString();
        }

        /**
         * Open screen
         * @param params Screen render parameters
         */
        public async open(params: any): Promise<void> {
            if (this.#open) return;
            document.title = this.title;
            if (this.ephemeral) {
                await this.renderer(params);
                ScreenManager.getInstance().closeAll();
                ScreenManager.getInstance().getContainer().appendChild(this.container);
            }
            else {
                ScreenManager.getInstance().closeAll();
                this.container.classList.remove("hidden");
            }
            this.#open = true;
        }

        /**
         * Close screen
         */
        public close(): void {
            if (!this.#open) return;
            if (this.ephemeral) {
                this.container.remove();
                this.initContainer();
            }
            else this.container.classList.add("hidden");
            this.#open = false;
        }
    }
}

export default ScreenManager;
