import { Plugin } from "obsidian";

export default class PolaroidPlugin extends Plugin {
	private observer: MutationObserver | null = null;

	async onload() {
		this.registerMarkdownPostProcessor((el) => {
			this.processEmbeds(el);
		});

		this.observer = new MutationObserver(() => {
			const container = document.querySelector(".workspace");
			if (!container) return;
			const embeds = container.querySelectorAll(
				".image-embed:not([data-caption])"
			);
			for (const embed of embeds) {
				this.setCaptionFromEmbed(embed as HTMLElement);
			}
		});

		const workspace = document.querySelector(".workspace");
		if (workspace) {
			this.observer.observe(workspace, {
				childList: true,
				subtree: true,
			});
		}

		this.processEmbeds(document.body);
	}

	private processEmbeds(root: ParentNode) {
		const embeds = root.querySelectorAll(".image-embed");
		for (const embed of embeds) {
			this.setCaptionFromEmbed(embed as HTMLElement);
		}
	}

	private setCaptionFromEmbed(embed: HTMLElement) {
		// Try alt/src on embed container first
		let raw = embed.getAttribute("alt") || embed.getAttribute("src") || "";

		// Fall back to child img attributes
		if (!raw) {
			const img = embed.querySelector("img");
			if (img) {
				raw = img.getAttribute("alt") || img.getAttribute("src") || "";
			}
		}

		if (!raw) return;

		const caption = this.cleanFilename(raw);
		if (caption) {
			embed.setAttribute("data-caption", caption);
		}

		// Set deterministic rotation based on filename hash
		const rotation = this.getRotation(raw);
		embed.style.setProperty("--polaroid-rotation", `${rotation}deg`);
	}

	private getRotation(name: string): number {
		const rotations = [-2, 1.5, -1, 2.5, -0.5];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
		}
		return rotations[Math.abs(hash) % rotations.length]!;
	}

	private cleanFilename(name: string): string {
		// Strip path prefix
		name = name.split("/").pop() ?? name;
		// Strip file extension
		name = name.replace(/\.(webp|png|jpe?g|gif|svg|bmp|tiff?)$/i, "");
		// Replace underscores and dashes with spaces
		name = name.replace(/[-_]/g, " ");
		// Capitalize first letter of each word
		name = name.replace(/\b\w/g, (c) => c.toUpperCase());
		return name.trim();
	}

	onunload() {
		if (this.observer) {
			this.observer.disconnect();
		}
		const workspace = document.querySelector(".workspace");
		if (workspace) {
			const embeds = workspace.querySelectorAll("[data-caption]");
			for (const embed of embeds) {
				embed.removeAttribute("data-caption");
			}
		}
	}
}
