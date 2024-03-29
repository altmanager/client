import "./styles.css";
import ScreenManager from "./ScreenManager";
import Navigation from "./Navigation";
import KeyboardShortcuts from "./KeyboardShortcuts";

const timeFormat = (date: Date, ago?: boolean) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s${ago ? " ago" : ""}`;
    if (minutes < 60) return `${minutes}m${ago ? " ago" : ""}`;
    if (hours < 24) return `${hours}h${ago ? " ago" : ""}`;
    return `${date.toLocaleDateString(undefined, {day: "numeric", month: "short"})}`;
};

const setStartSecondInterval = (callback: () => void) => {
    const currentMs = new Date().getMilliseconds();
    const delay = 1000 - currentMs;
    setTimeout(() => {
        callback();
        setInterval(callback, 1000);
    }, delay);
};

const screenManager = ScreenManager.getInstance();

const navigation = new Navigation([{
    text: "Players",
    click: () => screenManager.open("players").then()
}, {
    text: "Settings",
    click: () => screenManager.open("settings").then()
}]);

interface PartialPlayer {uuid: string, name: string, status: "online" | "offline", version?: string, server?: string, gameMode?: "survival" | string, health?: number, hunger?: number, lastOnline: Date | null};
interface Player extends PartialPlayer {
    coordinates: [number, number, number];
    ping: number;
}

screenManager.createScreen("loading", "Alt Manager", false, async function () {
    this.container.classList.add("flex", "justify-center", "items-center");
    const loader = document.createElement("div");
    loader.classList.add("w-12", "h-12", "border-2", "border-neutral-900", "border-t-neutral-300", "rounded-full", "animate-spin");
    this.container.appendChild(loader);
});

screenManager.createScreen("players", "Alt Manager", true, async function () {
    navigation.activate(0);
    this.container.appendChild(navigation.element);

    const container = document.createElement("div");
    container.classList.add("max-w-7xl", "mx-auto", "px-4", "md:px-6", "lg:px-8");
    this.container.appendChild(container);

    const grid = document.createElement("div");
    grid.classList.add("grid", "grid-cols-1", "sm:grid-cols-2", "md:grid-cols-3", "lg:grid-cols-4", "gap-8");
    container.appendChild(grid);

    // TODO: Fetch data from API
    const players: PartialPlayer[] = [
        {
            uuid: "853c80ef3c3749fdaa49938b674adae6",
            name: "Player1",
            status: "online",
            version: "1.16.5",
            server: "play.hypixel.net",
            gameMode: "survival",
            health: 20,
            hunger: 1.4,
            lastOnline: new Date()
        },
        {
            uuid: "853c80ef3c3749fdaa49938b674adae0",
            name: "Player2",
            status: "online",
            version: "1.19.4",
            server: "play.someserver.com",
            gameMode: "survival",
            health: 9,
            hunger: 17,
            lastOnline: new Date()
        },
        {
            uuid: "853c80ef3c3749fdaa49938b674adae1",
            name: "Player3",
            status: "online",
            version: "1.19.2",
            server: "127.0.0.1:25530",
            gameMode: "creative",
            lastOnline: new Date()
        },
        {
            uuid: "853c80ef3c3749fdaa49938b674adae2",
            name: "Player4",
            status: "online",
            version: "1.8.9",
            server: "localhost:25565",
            gameMode: "survival",
            health: 0,
            hunger: 0,
            lastOnline: new Date()
        },
        {
            uuid: "853c80ef3c3749fdaa49938b674adae3",
            name: "Player5",
            status: "offline",
            lastOnline: new Date(Date.now() - 1000 * 60 * 60 * 2.321)
        },
        {
            uuid: "853c80ef3c3749fdaa49938b674adae4",
            name: "Player6",
            status: "offline",
            lastOnline: null
        }
    ];

    const renderPlayerCard = (card: HTMLDivElement, player: PartialPlayer) => {
        let nameContainer = card.querySelector(":scope > div:nth-child(1)");
        if (!nameContainer) {
            nameContainer = document.createElement("div");
            nameContainer.classList.add("flex", "justify-between", "items-center");
            card.appendChild(nameContainer);
        }
        let name = nameContainer.querySelector("p");
        if (!name) {
            name = document.createElement("p");
            name.classList.add("text-white", "font-medium");
            nameContainer.appendChild(name);
        }
        name.textContent = player.name;

        let checkboxLabel = card.querySelector("label");
        if (!checkboxLabel) {
            checkboxLabel = document.createElement("label");
            checkboxLabel.classList.add("-mr-1");
            checkboxLabel.innerHTML = `<input type="checkbox" class="peer sr-only"><div class="w-5 h-5 border-2 border-white/20 rounded-full flex items-center justify-center text-transparent peer-checked:border-transparent peer-checked:bg-blue-500 peer-checked:text-white"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg></div>`;
            checkboxLabel.addEventListener("click", e => {
                e.stopImmediatePropagation();
                selectionToastRender();
            });
            nameContainer.appendChild(checkboxLabel);
        }

        let statusContainer = card.querySelector(":scope > div:nth-child(2)");
        if (!statusContainer) {
            statusContainer = document.createElement("div");
            statusContainer.classList.add("flex", "items-center", "space-x-2", "mt-2");
            card.appendChild(statusContainer);
        }

        const status: "online" | "dead" | "offline" = player.status === "online" ? (player.health === 0 ? "dead" : "online") : "offline";

        let statusIndicator = statusContainer.querySelector("div");
        if (!statusIndicator) {
            statusIndicator = document.createElement("div");
            statusIndicator.classList.add("w-2", "h-2", "shrink-0", "relative");
            statusContainer.appendChild(statusIndicator);
        }

        if (status === "online")  statusIndicator.innerHTML = `<div class="w-full h-full bg-green-500 rounded-full"></div><div class="absolute animate-ping top-0 w-full h-full bg-green-500 rounded-full"></div>`;
        else statusIndicator.innerHTML = `<div class="w-full h-full ${status === "offline" ? "bg-red-500" : "bg-amber-500"} rounded-full"></div>`;

        let statusText = statusContainer.querySelector("p");
        if (!statusText) {
            statusText = document.createElement("p");
            statusText.classList.add("text-neutral-400", "text-sm", "truncate");
            statusContainer.appendChild(statusText);
        }

        if (status === "offline") statusText.textContent = "Offline";
        else statusText.textContent = `${status === "online" ? "Online" : "Dead"} · ${player.version} · ${player.server}`;

        let specialContainer = card.querySelector(":scope > div:nth-child(3)");
        if (!specialContainer) {
            specialContainer = document.createElement("div");
            card.appendChild(specialContainer);
        }

        if (player.gameMode === "creative" || player.status === "offline") {
            specialContainer.classList.add("flex", "h-16");
            specialContainer.innerHTML = `<p class="m-auto text-neutral-400 text-sm">${player.status === "offline" ? `Last online: ${player.lastOnline ? timeFormat(player.lastOnline, true) : "never"}` : "Creative mode"}</p>`;
        }
        else if (player.status === "online") {
            specialContainer.classList.add("flex", "flex-col", "mt-4", "space-y-2");

            let healthContainer = specialContainer.querySelector(":scope > div:nth-child(1)");
            if (!healthContainer) {
                healthContainer = document.createElement("div");
                healthContainer.classList.add("flex", "items-center", "space-x-4");

                healthContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-neutral-500"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"></path></svg>`;
                specialContainer.appendChild(healthContainer);
            }

            let hungerContainer = specialContainer.querySelector(":scope > div:nth-child(2)");
            if (!hungerContainer) {
                hungerContainer = document.createElement("div");
                hungerContainer.classList.add("flex", "items-center", "space-x-4");

                hungerContainer.innerHTML = `<svg class="w-5 h-5 text-neutral-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74C370 2 365.1 0 360 0s-10 2-13.3 6zM244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-55.3-55.3 0 .1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L199.7 433l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136z"></path></svg>`;
                specialContainer.appendChild(hungerContainer);
            }

            let healthBar = healthContainer.querySelector("div");
            if (!healthBar) {
                healthBar = document.createElement("div");
                healthBar.classList.add("h-3", "bg-neutral-800", "w-full", "rounded-full", "ring-1", "ring-inset", "ring-white/5");
                healthContainer.appendChild(healthBar);
            }

            let hungerBar = hungerContainer.querySelector("div");
            if (!hungerBar) {
                hungerBar = document.createElement("div");
                hungerBar.classList.add("h-3", "bg-neutral-800", "w-full", "rounded-full", "ring-1", "ring-inset", "ring-white/5");
                hungerContainer.appendChild(hungerBar);
            }

            let healthProgress = healthBar.querySelector("div");
            if (!healthProgress) {
                healthProgress = document.createElement("div");
                healthProgress.classList.add("h-full", "rounded-full", "transition-all", "ease-in-out");
                healthBar.appendChild(healthProgress);
            }

            let hungerProgress = hungerBar.querySelector("div");
            if (!hungerProgress) {
                hungerProgress = document.createElement("div");
                hungerProgress.classList.add("h-full", "rounded-full", "transition-all", "ease-in-out");
                hungerBar.appendChild(hungerProgress);
            }

            const colors: Record<string, string> = {
                100: "bg-green-500",
                50: "bg-amber-500",
                25: "bg-red-500"
            };

            const healthPercentage = Math.round(player.health! / 20 * 100);
            const hungerPercentage = Math.round(player.hunger! / 20 * 100);
            const minColors = Object.keys(colors).map(Number).sort((a, b) => a - b);
            const healthColor = colors[minColors.find(color => healthPercentage <= color)!]!;
            const hungerColor = colors[minColors.find(color => hungerPercentage <= color)!]!;
            healthProgress.classList.remove(...Object.values(colors));
            healthProgress.classList.add(healthColor);
            healthProgress.style.width = `${healthPercentage}%`;

            hungerProgress.classList.remove(...Object.values(colors));
            hungerProgress.classList.add(hungerColor);
            hungerProgress.style.width = `${hungerPercentage}%`;
        }
    }

    for (const player of players) {
        const card = document.createElement("div");
        card.dataset.uuid = player.uuid;
        card.classList.add("bg-neutral-900", "rounded-2xl", "px-4", "py-3", "border", "border-transparent", "ring-1", "ring-inset", "ring-white/5", "hover:ring-white/20", "cursor-pointer");
        renderPlayerCard(card, player);
        card.addEventListener("click", e => {
            if (e.ctrlKey) {
                (card.querySelector("input[type=checkbox]") as HTMLInputElement).checked = !(card.querySelector("input[type=checkbox]") as HTMLInputElement).checked;
                selectionToastRender();
                return;
            }
            screenManager.open("player", player);
        });
        grid.appendChild(card);
    }

    const emptyState = document.createElement("div");
    emptyState.classList.add("rounded-2xl", "flex", "min-h-[8rem]", "py-1", "border-2", "border-dashed", "border-neutral-800", "cursor-pointer", "font-medium", "text-neutral-600", "hover:text-neutral-400", "hover:border-neutral-600");
    emptyState.innerHTML = `<div class="m-auto flex space-x-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg><p>Add new</p></div>`;
    grid.appendChild(emptyState);

    const selectionToastContainer = document.createElement("div");
    selectionToastContainer.innerHTML = `<div class="h-32"></div><div class="fixed bottom-0 inset-x-0"><div class="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8"><div class="px-6 py-4 bg-neutral-900 rounded-xl flex justify-between items-center"><div class="flex space-x-3 items-center"></div><button class="text-red-400 hover:text-red-500">Remove</button></div></div></div>`;
    selectionToastContainer.classList.add("hidden");
    this.container.appendChild(selectionToastContainer);

    const selectionToastBody = selectionToastContainer.querySelector(":scope > div > div > div > div")!;
    const selectionToastText = document.createElement("p");
    selectionToastText.classList.add("text-white", "text-sm");
    selectionToastBody.appendChild(selectionToastText);

    const selectionToastDeselect = document.createElement("button");
    selectionToastDeselect.classList.add("text-blue-300", "hover:text-blue-400", "text-sm", "font-medium");
    selectionToastDeselect.innerHTML = "Deselect";
    selectionToastDeselect.addEventListener("click", () => {
        (grid.querySelectorAll("[data-uuid] input[type=checkbox]:checked") as NodeListOf<HTMLInputElement>).forEach(b => b.checked = false);
        selectionToastRender();
    });
    selectionToastBody.appendChild(selectionToastDeselect);

    const selectionToastSelectAll = document.createElement("button");
    selectionToastSelectAll.classList.add("text-blue-300", "hover:text-blue-400", "text-sm", "font-medium");
    selectionToastSelectAll.innerHTML = "Select All";
    selectionToastSelectAll.addEventListener("click", () => {
        (grid.querySelectorAll("[data-uuid] input[type=checkbox]") as NodeListOf<HTMLInputElement>).forEach(b => b.checked = true);
        selectionToastRender();
    });
    selectionToastBody.appendChild(selectionToastSelectAll);

    const selectionToastRemove = selectionToastContainer.querySelector(":scope > div > div > div > button")!;
    selectionToastRemove.addEventListener("click", () => {
        (grid.querySelectorAll("[data-uuid] input[type=checkbox]:checked") as NodeListOf<HTMLInputElement>).forEach(b => b.closest("[data-uuid]")!.remove());
        selectionToastRender();
    });

    const selectionToastRender = () => {
        const selected = [...grid.querySelectorAll("[data-uuid] input[type=checkbox]:checked")].map(e => e.closest("[data-uuid]"));
        if (selected.length === 0) {
            selectionToastContainer.classList.add("hidden");
        }
        else {
            selectionToastContainer.classList.remove("hidden");
            selectionToastText.innerHTML = `${selected.length} player${selected.length === 1 ? "" : "s"} selected`;
        }
    };

    KeyboardShortcuts.getInstance().register([["ctrl", "a"]], () => {
        // if all are selected, deselect all. otherwise, select all
        const selected = [...grid.querySelectorAll("[data-uuid] input[type=checkbox]:checked")].map(e => e.closest("[data-uuid]"));
        if (selected.length === players.length) (grid.querySelectorAll("[data-uuid] input[type=checkbox]:checked") as NodeListOf<HTMLInputElement>).forEach(b => b.checked = false);
        else (grid.querySelectorAll("[data-uuid] input[type=checkbox]") as NodeListOf<HTMLInputElement>).forEach(b => b.checked = true);
        selectionToastRender();
    }, "Select all players", "players");
});

screenManager.createScreen("settings", "Alt Manager | Settings", true, async function () {
    navigation.activate(1);
    this.container.appendChild(navigation.element);
});

screenManager.createScreen("player", "Alt Manager", true, async function (p: PartialPlayer) {
    // TODO: Fetch data from API
    const player: Player = Object.assign(p, {
        coordinates: [213, -13, -2334],
        ping: 12
    }) as Player;


    document.title += ` | ${player.name}`;
    const nav = navigation.clone();
    nav.activate(-1);
    nav.element.querySelector(":scope > div")!.classList.remove("max-w-7xl");
    nav.element.querySelector(":scope > div")!.classList.add("container");
    this.container.appendChild(nav.element);

    this.container.classList.remove("bg-neutral-950");
    this.container.classList.add("bg-neutral-900");

    const container = document.createElement("div");
    container.classList.add("container", "mx-auto", "px-4", "md:px-6", "lg:px-8", "mt-2");
    this.container.appendChild(container);

    const header = document.createElement("header");
    header.classList.add("flex", "items-center", "justify-between");
    container.appendChild(header);

    const headerProfile = document.createElement("div");
    headerProfile.classList.add("flex", "items-center", "space-x-6");
    headerProfile.innerHTML = `<img alt="${player.name}" class="w-16 h-16 rounded-lg bg-neutral-800" src="https://crafatar.com/avatars/${player.uuid}?size=100">`;
    header.appendChild(headerProfile);

    const headerProfileDetails = document.createElement("div");
    headerProfile.appendChild(headerProfileDetails);

    const title = document.createElement("h1");
    title.classList.add("text-white", "font-bold", "text-xl");
    title.innerText = player.name;
    headerProfileDetails.appendChild(title);

    const headerProfileDetailsStatus = document.createElement("div");
    headerProfileDetailsStatus.classList.add("flex", "items-center", "space-x-2", "mt-1");
    headerProfileDetails.appendChild(headerProfileDetailsStatus);

    const headerProfileDetailsStatusIndicator = document.createElement("div");
    headerProfileDetailsStatusIndicator.classList.add("w-2", "h-2", "shrink-0", "relative");
    if (player.status === "online") headerProfileDetailsStatusIndicator.innerHTML = `<div class="w-full h-full bg-green-500 rounded-full"></div><div class="absolute animate-ping top-0 w-full h-full bg-green-500 rounded-full"></div>`;
    else headerProfileDetailsStatusIndicator.innerHTML = `<div class="w-full h-full ${player.status === "offline" ? "bg-red-500" : "bg-amber-500"} rounded-full"></div>`;
    headerProfileDetailsStatus.appendChild(headerProfileDetailsStatusIndicator);

    const headerProfileDetailsStatusText = document.createElement("p");
    headerProfileDetailsStatusText.classList.add("text-neutral-400", "text-sm", "truncate");
    if (player.status === "offline") headerProfileDetailsStatusText.textContent = `Offline · Last online ${player.lastOnline ? timeFormat(player.lastOnline) : "never"}`;
    else headerProfileDetailsStatusText.textContent = `${player.status === "online" ? "Online" : "Dead"} · ${player.version} · ${player.server}`;
    headerProfileDetailsStatus.appendChild(headerProfileDetailsStatusText);

    const headerButtons = document.createElement("div");
    headerButtons.classList.add("flex", "space-x-3");
    header.appendChild(headerButtons);

    const disconnectButton = document.createElement("button");
    disconnectButton.classList.add("bg-neutral-800", "text-white", "font-semibold", "text-sm", "px-3", "py-2", "rounded-lg", "border", "border-neutral-700/50", "hover:bg-neutral-800/60", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-neutral-900", "focus:ring-blue-500");
    disconnectButton.textContent = "Disconnect";

    const connectButton = document.createElement("button");
    connectButton.classList.add("bg-blue-500", "text-white", "font-semibold", "text-sm", "px-3", "py-2", "rounded-lg", "border", "border-neutral-800", "hover:bg-blue-600", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-neutral-900", "focus:ring-blue-500");
    connectButton.textContent = "Connect";

    const relogButton = document.createElement("button");
    relogButton.classList.add("bg-blue-500", "text-white", "font-semibold", "text-sm", "px-3", "py-2", "rounded-lg", "border", "border-neutral-800", "hover:bg-blue-600", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-neutral-900", "focus:ring-blue-500");
    relogButton.textContent = "Relog";

    if (player.status === "online") {
        headerButtons.appendChild(disconnectButton);
        headerButtons.appendChild(relogButton);
    } else headerButtons.appendChild(connectButton);

    const topBox = document.createElement("div");
    topBox.classList.add("mt-12", "flex", "flex-col", "lg:flex-row", "gap-x-6", "gap-y-6");
    container.appendChild(topBox);

    const terminal = document.createElement("div");
    terminal.classList.add("rounded-2xl", "bg-neutral-950", "border", "border-neutral-800", "flex", "flex-col", "overflow-hidden", "relative", "w-full");
    topBox.appendChild(terminal);

    const terminalButtons = document.createElement("div");
    terminalButtons.classList.add("flex", "absolute", "top-2", "right-2", "space-x-2");
    terminal.appendChild(terminalButtons);

    const terminalPopoutButton = document.createElement("button");
    terminalPopoutButton.classList.add("text-neutral-600", "hover:text-neutral-300");
    terminalPopoutButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" /></svg>`;
    terminalButtons.appendChild(terminalPopoutButton);

    const terminalExpandButton = document.createElement("button");
    terminalExpandButton.classList.add("text-neutral-600", "hover:text-neutral-300");
    terminalExpandButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.747.747 0 01-.75-.75zM12.22 13.28l3.22 3.22h-2.69a.75.75 0 000 1.5h4.5a.747.747 0 00.75-.75v-4.5a.75.75 0 00-1.5 0v2.69l-3.22-3.22a.75.75 0 10-1.06 1.06zM3.5 4.56l3.22 3.22a.75.75 0 001.06-1.06L4.56 3.5h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0V4.56z" /></svg>`;
    terminalButtons.appendChild(terminalExpandButton);

    const terminalText = document.createElement("div");
    terminalText.classList.add("h-96", "overflow-auto", "text-neutral-200", "font-mono", "text-sm", "p-2");
    terminal.appendChild(terminalText);

    const terminalInputContainer = document.createElement("form");
    terminalInputContainer.classList.add("border-t", "border-neutral-800", "relative");
    terminalInputContainer.addEventListener("submit", e => {
        e.preventDefault();
        const p = document.createElement("p");
        p.textContent = terminalInput.value;
        terminalText.appendChild(p);
        terminalInput.value = "";
        changeTerminalInputIcon();
    });
    terminal.appendChild(terminalInputContainer);

    const terminalInput = document.createElement("input");
    terminalInput.classList.add("w-full", "pl-9", "p-2", "bg-transparent", "text-white", "placeholder:text-neutral-500", "focus:outline-none", "peer");
    terminalInput.placeholder = "Chat or type command…";
    const changeTerminalInputIcon = () => {
        terminalInputIcons.querySelectorAll("svg").forEach(svg => svg.classList.add("hidden"));
        if (terminalInput.value.startsWith("/")) terminalInputIcons.querySelector("svg:nth-child(2)")!.classList.remove("hidden");
        else if (terminalInput.value.startsWith(".")) terminalInputIcons.querySelector("svg:nth-child(3)")!.classList.remove("hidden");
        else terminalInputIcons.querySelector("svg:nth-child(1)")!.classList.remove("hidden");
    }
    terminalInput.addEventListener("input", changeTerminalInputIcon);
    terminalInputContainer.appendChild(terminalInput);

    const terminalInputIcons = document.createElement("div");
    terminalInputIcons.classList.add("text-neutral-400", "peer-focus:text-blue-400", "absolute", "top-2", "left-2", "pointer-events-none");
    terminalInputIcons.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clip-rule="evenodd" /></svg>`;
    terminalInputIcons.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 hidden"><path fill-rule="evenodd" d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h13.5A2.25 2.25 0 0019 14.75v-9.5A2.25 2.25 0 0016.75 3H3.25zm.943 8.752a.75.75 0 01.055-1.06L6.128 9l-1.88-1.693a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.06-.055zM9.75 10.25a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" clip-rule="evenodd" /></svg>`;
    terminalInputIcons.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 hidden"><path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" /></svg>`;
    terminalInputContainer.appendChild(terminalInputIcons);

    const terminalInputSubmit = document.createElement("button");
    terminalInputSubmit.classList.add("sr-only");
    terminalInputSubmit.type = "submit";
    terminalInputContainer.appendChild(terminalInputSubmit);

    const playerDetailsCard = document.createElement("div");
    playerDetailsCard.classList.add("rounded-2xl", "bg-neutral-800", "border", "border-neutral-700/50", "w-80", "shrink-0", "p-4", "flex", "flex-col", "justify-between");
    topBox.appendChild(playerDetailsCard);

    const playerDetailsTopBox = document.createElement("div");
    playerDetailsTopBox.classList.add("flex", "flex-col", "space-y-3");
    playerDetailsCard.appendChild(playerDetailsTopBox);

    const playerDetailsTopBoxServer = document.createElement("div");
    playerDetailsTopBoxServer.classList.add("flex", "gap-x-3", "group", "cursor-pointer");
    playerDetailsTopBoxServer.innerHTML = `<div class="text-neutral-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 group-hover:hidden"><path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A3.489 3.489 0 0016 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234z" /><path fill-rule="evenodd" d="M4 13a2 2 0 100 4h12a2 2 0 100-4H4zm11.24 2a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V15zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75h-.01z" clip-rule="evenodd" /></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 hidden group-hover:block"><path fill-rule="evenodd" d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5v-3.379a3 3 0 00-.879-2.121l-3.12-3.121a3 3 0 00-1.402-.791 2.252 2.252 0 011.913-1.576A2.25 2.25 0 0112.25 1h1.5a2.25 2.25 0 012.238 2.012zM11.5 3.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.25h-3v-.25z" clip-rule="evenodd" /><path d="M3.5 6A1.5 1.5 0 002 7.5v9A1.5 1.5 0 003.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L8.44 6.439A1.5 1.5 0 007.378 6H3.5z" /></svg></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 hidden text-green-500"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg><p class="text-white text-sm font-mono leading-5">${player.server}</p>`
    playerDetailsTopBoxServer.addEventListener("click", () => {
        navigator.clipboard.writeText(player.server!).then(() => {
            playerDetailsTopBoxServer.querySelector(":scope > div")!.classList.add("hidden");
            playerDetailsTopBoxServer.querySelector(":scope > svg")!.classList.remove("hidden");
            setTimeout(() => {
                playerDetailsTopBoxServer.querySelector(":scope > div")!.classList.remove("hidden");
                playerDetailsTopBoxServer.querySelector(":scope > svg")!.classList.add("hidden");
            }, 2000);
        });
    });
    playerDetailsTopBox.appendChild(playerDetailsTopBoxServer);

    const playerDetailsTopBoxCoordinates = document.createElement("div");
    playerDetailsTopBoxCoordinates.classList.add("flex", "gap-x-3", "group", "cursor-pointer");
    playerDetailsTopBoxCoordinates.innerHTML = `<div class="text-neutral-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 group-hover:hidden"><path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" /></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 hidden group-hover:block"><path fill-rule="evenodd" d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5v-3.379a3 3 0 00-.879-2.121l-3.12-3.121a3 3 0 00-1.402-.791 2.252 2.252 0 011.913-1.576A2.25 2.25 0 0112.25 1h1.5a2.25 2.25 0 012.238 2.012zM11.5 3.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.25h-3v-.25z" clip-rule="evenodd" /><path d="M3.5 6A1.5 1.5 0 002 7.5v9A1.5 1.5 0 003.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L8.44 6.439A1.5 1.5 0 007.378 6H3.5z" /></svg></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 hidden text-green-500"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg><p class="text-white text-sm font-mono leading-5"><span class="font-semibold">X:</span> ${player.coordinates[0].toLocaleString()} <span class="font-semibold">Y:</span> ${player.coordinates[1].toLocaleString()} <span class="font-semibold">Z:</span> ${player.coordinates[2].toLocaleString()}</p>`
    playerDetailsTopBoxCoordinates.addEventListener("click", () => {
        navigator.clipboard.writeText(`${player.coordinates[0]} ${player.coordinates[1]} ${player.coordinates[2]}`).then(() => {
            playerDetailsTopBoxCoordinates.querySelector(":scope > div")!.classList.add("hidden");
            playerDetailsTopBoxCoordinates.querySelector(":scope > svg")!.classList.remove("hidden");
            setTimeout(() => {
                playerDetailsTopBoxCoordinates.querySelector(":scope > div")!.classList.remove("hidden");
                playerDetailsTopBoxCoordinates.querySelector(":scope > svg")!.classList.add("hidden");
            }, 2000);
        });
    });
    playerDetailsTopBox.appendChild(playerDetailsTopBoxCoordinates);

    const playerDetailsTopBoxClock = document.createElement("div");
    playerDetailsTopBoxClock.classList.add("flex", "gap-x-3");
    playerDetailsTopBoxClock.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-neutral-500"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" /></svg>`;
    playerDetailsTopBox.appendChild(playerDetailsTopBoxClock);

    const clock = document.createElement("p");
    clock.classList.add("text-white", "text-sm", "font-mono", "leading-5");
    const clockTick = () => {
        if (!player.lastOnline) {
            clock.innerText = "never";
            return;
        }
        const interval = Date.now() - player.lastOnline.getTime();
        clock.innerText = `${Math.floor(interval / 1000 / 60 / 60).toString()}:${Math.floor(interval / 1000 / 60).toString().padStart(2, "0")}:${Math.floor(interval / 1000).toString().padStart(2, "0")}`;
    }
    setStartSecondInterval(clockTick);
    clockTick();
    playerDetailsTopBoxClock.appendChild(clock);

    const playerDetailsTopBoxVersion = document.createElement("div");
    playerDetailsTopBoxVersion.classList.add("flex", "gap-x-3");
    playerDetailsTopBoxVersion.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-neutral-500"><path fill-rule="evenodd" d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z" clip-rule="evenodd" /></svg><p class="text-white text-sm">${player.version}</p>`;
    playerDetailsTopBox.appendChild(playerDetailsTopBoxVersion);

    const playerDetailsTopBoxPing = document.createElement("div");
    playerDetailsTopBoxPing.classList.add("flex", "gap-x-3");
    playerDetailsTopBoxPing.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-neutral-500"><path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" /></svg><p class="text-white text-sm">${player.ping}ms</p>`;
    playerDetailsTopBox.appendChild(playerDetailsTopBoxPing);

    const playerDetailsBottomBox = document.createElement("div");
    playerDetailsBottomBox.classList.add("flex", "flex-col", "space-y-3", "mt-6");
    playerDetailsCard.appendChild(playerDetailsBottomBox);

    const playerDetailsBottomBoxMetrics = document.createElement("div");
    playerDetailsBottomBoxMetrics.classList.add("flex", "flex-col", "space-y-2");
    playerDetailsBottomBox.appendChild(playerDetailsBottomBoxMetrics);

    const healthContainer = document.createElement("div");
    healthContainer.classList.add("flex", "items-center", "space-x-4");
    healthContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-neutral-500"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"></path></svg>`;
    playerDetailsBottomBoxMetrics.appendChild(healthContainer);

    const hungerContainer = document.createElement("div");
    hungerContainer.classList.add("flex", "items-center", "space-x-4");
    hungerContainer.innerHTML = `<svg class="w-5 h-5 text-neutral-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M346.7 6C337.6 17 320 42.3 320 72c0 40 15.3 55.3 40 80s40 40 80 40c29.7 0 55-17.6 66-26.7c4-3.3 6-8.2 6-13.3s-2-10-6-13.2c-11.4-9.1-38.3-26.8-74-26.8c-32 0-40 8-40 8s8-8 8-40c0-35.7-17.7-62.6-26.8-74C370 2 365.1 0 360 0s-10 2-13.3 6zM244.6 136c-40 0-77.1 18.1-101.7 48.2l60.5 60.5c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-55.3-55.3 0 .1L2.2 477.9C-2 487-.1 497.8 7 505s17.9 9 27.1 4.8l134.7-62.4-52.1-52.1c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L199.7 433l100.2-46.4c46.4-21.5 76.2-68 76.2-119.2C376 194.8 317.2 136 244.6 136z"></path></svg>`;
    playerDetailsBottomBoxMetrics.appendChild(hungerContainer);

    const healthBar = document.createElement("div");
    healthBar.classList.add("h-3", "bg-neutral-800", "w-full", "rounded-full", "ring-1", "ring-inset", "ring-white/5");
    healthContainer.appendChild(healthBar);

    const hungerBar = document.createElement("div");
    hungerBar.classList.add("h-3", "bg-neutral-800", "w-full", "rounded-full", "ring-1", "ring-inset", "ring-white/5");
    hungerContainer.appendChild(hungerBar);

    const healthProgress = document.createElement("div");
    healthProgress.classList.add("h-full", "rounded-full", "transition-all", "ease-in-out");
    healthBar.appendChild(healthProgress);

    const hungerProgress = document.createElement("div");
    hungerProgress.classList.add("h-full", "rounded-full", "transition-all", "ease-in-out");
    hungerBar.appendChild(hungerProgress);

    const colors: Record<string, string> = {
        100: "bg-green-500",
        50: "bg-amber-500",
        25: "bg-red-500"
    };

    const healthPercentage = Math.round(player.health! / 20 * 100);
    const hungerPercentage = Math.round(player.hunger! / 20 * 100);
    const minColors = Object.keys(colors).map(Number).sort((a, b) => a - b);
    const healthColor = colors[minColors.find(color => healthPercentage <= color)!]!;
    const hungerColor = colors[minColors.find(color => hungerPercentage <= color)!]!;
    healthProgress.classList.remove(...Object.values(colors));
    healthProgress.classList.add(healthColor);
    healthProgress.style.width = `${healthPercentage}%`;

    hungerProgress.classList.remove(...Object.values(colors));
    hungerProgress.classList.add(hungerColor);
    hungerProgress.style.width = `${hungerPercentage}%`;

    const playButton = document.createElement("button");
    playButton.classList.add("bg-blue-500", "text-white", "font-semibold", "px-3", "py-2", "group", "flex", "rounded-xl", "border", "border-neutral-800", "hover:bg-blue-600", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-offset-neutral-900", "focus:ring-blue-500");
    playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 -mr-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg><span class="mx-auto">Play</span>`;
    playerDetailsBottomBox.appendChild(playButton);
});

document.addEventListener("DOMContentLoaded", () => {
    screenManager.open("loading").then();
});

window.addEventListener("load", () => {
    screenManager.open("players").then();
});

window.addEventListener("keydown", event => KeyboardShortcuts.getInstance().handleKeyboardEvent(event));
