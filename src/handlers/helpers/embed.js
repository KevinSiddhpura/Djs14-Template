const { EmbedBuilder } = require("@discordjs/builders");
const { Colors } = require("discord.js");

/**
 * The layout for embed options
 * @typedef {Object} EmbedLayout
 * @property {string} Title - The title of the embed.
 * @property {string} Description - The description of the embed.
 * @property {Colors} Color - The color of the embed.
 * @property {string} Image - The image URL of the embed.
 * @property {string} Thumbnail - The thumbnail URL of the embed.
 * @property {Array<Object>} Fields - The fields of the embed.
 * @property {boolean} Timestamp - Whether to include a timestamp.
 * @property {string} FooterText - The text for the footer.
 * @property {string} FooterIcon - The icon URL for the footer.
 * @property {string} AuthorName - The name for the author section.
 * @property {string} AuthorIcon - The icon URL for the author section.
 */

/**
 * A class for creating Discord embeds using provided options.
 */
class EmbedCreator {
    /**
     * Constructs an embed from the provided layout options.
     * @param {EmbedLayout} options - The options for the embed.
     * @returns {EmbedBuilder} - The constructed EmbedBuilder object.
     */
    constructor(options) {
        this.embedOptions = { ...EmbedCreator.defaultEmbedOptions(), ...options };

        const embed = new EmbedBuilder();

        // Set basic properties
        if (this.embedOptions.Title) embed.setTitle(this.embedOptions.Title);
        if (this.embedOptions.Description) embed.setDescription(this.embedOptions.Description);
        if (this.embedOptions.Color) embed.setColor(this.embedOptions.Color);
        if (this.embedOptions.Image) embed.setImage(this.embedOptions.Image);
        if (this.embedOptions.Thumbnail) embed.setThumbnail(this.embedOptions.Thumbnail);
        if (this.embedOptions.Timestamp) embed.setTimestamp();

        // Set footer
        if (this.embedOptions.FooterText || this.embedOptions.FooterIcon) {
            const footerOptions = {
                text: this.embedOptions.FooterText || '',
                iconURL: this.embedOptions.FooterIcon || null
            };
            embed.setFooter(footerOptions);
        }

        // Set author
        if (this.embedOptions.AuthorName || this.embedOptions.AuthorIcon) {
            const authorOptions = {
                name: this.embedOptions.AuthorName || '',
                iconURL: this.embedOptions.AuthorIcon || null
            };
            embed.setAuthor(authorOptions);
        }

        // Add fields
        if (this.embedOptions.Fields?.length > 0) {
            this.embedOptions.Fields.forEach(field => {
                if (field.Name && field.Value) {
                    embed.addFields({
                        name: field.Name,
                        value: field.Value,
                        inline: field.Inline ?? false
                    });
                }
            });
        }

        return embed;
    }

    /**
     * Static method to create multiple embeds from an array of embed options.
     * @param {EmbedLayout[]} embedOptionsArray - An array of embed options.
     * @returns {EmbedBuilder[]} - An array of EmbedBuilder objects.
     */
    static createEmbeds(embedOptionsArray) {
        return embedOptionsArray.map(options => new EmbedCreator(options));
    }

    /**
     * Provides a default embed layout that can be used as a base.
     * @returns {EmbedLayout} - The default embed options.
     */
    static defaultEmbedOptions() {
        return {
            Title: null,
            Description: null,
            Color: [49, 51, 56], // Default color
            Image: null,
            Thumbnail: null,
            Fields: [],
            Timestamp: false,
            FooterText: null,
            FooterIcon: null,
            AuthorName: null,
            AuthorIcon: null,
        };
    }

    /**
     * Creates a simple embed with just a title, description, and optional color.
     * @param {string} title - The title of the embed.
     * @param {string} description - The description of the embed.
     * @param {Colors} color - The color of the embed.
     * @returns {EmbedBuilder} - A simple embed.
     */
    static quickEmbed(title = null, description = null, color = Colors.Default) {
        if (title == null && description == null) throw new Error("You must provide either Title or Description to create an embed");
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);
    }
}

module.exports = EmbedCreator