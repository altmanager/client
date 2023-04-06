import ScreenManager from "./ScreenManager";

/**
 * Navigation component
 */
class Navigation {
    /**
     * Container
     */
    public readonly element = document.createElement("nav");

    /**
     * Construct navigation component
     */
    constructor(private readonly items: Navigation.Item[]) {
        const container = document.createElement("div");
        container.classList.add("max-w-7xl", "mx-auto", "px-4", "md:px-6", "lg:px-8", "py-6", "flex", "space-x-2", "items-center");
        this.element.appendChild(container);

        const title = document.createElement("h1");
        title.classList.add("text-white", "text-lg", "font-bold", "mr-8", "cursor-pointer");
        title.textContent = "alt manager";
        title.addEventListener("click", () => ScreenManager.getInstance().open("players"));
        container.appendChild(title);

        for (const i in this.items) {
            const item = this.items[i]!;
            const button = document.createElement("button");
            button.textContent = item.text;
            button.classList.add("font-medium", "border", "border-transparent", "py-2", "px-4", "rounded-lg");
            button.addEventListener("click", item.click);
            container.appendChild(button);
            this.activate(i);
        }
    }

    /**
     * Clone this navigation component
     */
    public clone(): Navigation {
        return new Navigation(this.items);
    }

    /**
     * Activate item
     * @param index Item index
     */
    public activate(index: string | number): void {
        for (const i in this.items) {
            const item = this.items[i]!;
            const button = this.element.querySelector(`button:nth-of-type(${Number(i) + 1})`);
            if (!button) return;
            item.active = i === index.toString();

            if (item.active) {
                button.classList.add("text-white", "bg-neutral-900");
                button.classList.remove("text-neutral-400", "hover:text-neutral-300");
            }
            else {
                button.classList.remove("text-white", "bg-neutral-900");
                button.classList.add("text-neutral-400", "hover:text-neutral-300");
            }
        }
    }
}

namespace Navigation {
    export interface Item {
        /**
         * Item text
         */
        text: string;

        /**
         * Click handler
         */
        click: () => void;

        /**
         * Whether the item is active
         */
        active?: boolean;
    }
}

export default Navigation;
