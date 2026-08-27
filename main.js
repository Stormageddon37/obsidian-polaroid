const { Plugin } = require('obsidian');

class PolaroidPlugin extends Plugin {
  async onload() {
    // Process images in rendered markdown
    this.registerMarkdownPostProcessor((el) => {
      this.processEmbeds(el);
    });

    // Also observe DOM for dynamically loaded embeds
    this.observer = new MutationObserver(() => {
      const embeds = document.querySelectorAll(
        '.markdown-rendered .image-embed:not([data-caption])'
      );
      for (const embed of embeds) {
        this.setCaptionFromEmbed(embed);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['src', 'alt'],
    });

    // Process any already-rendered embeds
    this.processEmbeds(document.body);
  }

  processEmbeds(root) {
    const embeds = root.querySelectorAll('.image-embed');
    for (const embed of embeds) {
      this.setCaptionFromEmbed(embed);
    }
  }

  setCaptionFromEmbed(embed) {
    // Try alt first (set by ![alt](url) syntax or ![[file|alt]] pipe syntax)
    // Then src (set by ![[file.png]] syntax)
    const raw = embed.getAttribute('alt') || embed.getAttribute('src') || '';
    if (!raw) return;

    const caption = this.cleanFilename(raw);
    if (caption) {
      embed.setAttribute('data-caption', caption);
    }
  }

  cleanFilename(name) {
    // Strip path prefix
    name = name.split('/').pop();
    // Strip file extension
    name = name.replace(/\.(webp|png|jpe?g|gif|svg|bmp|tiff?)$/i, '');
    // Replace underscores and dashes with spaces
    name = name.replace(/[-_]/g, ' ');
    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, (c) => c.toUpperCase());
    return name.trim();
  }

  onunload() {
    if (this.observer) {
      this.observer.disconnect();
    }
    // Clean up data-caption attributes
    const embeds = document.querySelectorAll('[data-caption]');
    for (const embed of embeds) {
      embed.removeAttribute('data-caption');
    }
  }
}

module.exports = PolaroidPlugin;
