const { EmbedBuilder } = require("@discordjs/builders");
const { Colors } = require("discord.js");

const embedLayout = {
    /** @type {string} */
    Title: null,
    /** @type {string} */
    Description: null,
    /** @type {Colors} */
    Color: null,
    /** @type {string} */
    Image: null,
    /** @type {string} */
    Thumbnail: String,
    /** @type {Array} */
    Fields: [{
        /** @type {string} */
        Name: String,
        /** @type {string} */
        Value: String,
        /** @type {Boolean} */
        Inline: Boolean
    }],
    /** @type {Boolean} */
    Timestamp: null,
    /** @type {string} */
    FooterText: null,
    /** @type {string} */
    FooterIcon: null,
    /** @type {string} */
    AuthorName: null,
    /** @type {string} */
    AuthorIcon: null,
}

class EmbedCreator {
    /**@param {embedLayout} options */
    constructor(options) {
        const embedOptions = { ...options };

        Object.entries(embedOptions)
            .forEach(([k, v]) => this[k] = v || null)

        const Embed = new EmbedBuilder();

        if (this.Title) Embed.setTitle(this.Title);
        if (this.Description) Embed.setDescription(this.Description);
        if (this.Color) Embed.setColor(this.Color);
        if (this.Image) Embed.setImage(this.Image);
        if (this.Thumbnail) Embed.setThumbnail(this.Thumbnail);
        if (this.Timestamp) Embed.setTimestamp(Date.now());

        if (this.FooterText && this.FooterIcon) Embed.setFooter({ text: this.FooterText, iconURL: this.FooterIcon });
        else if (this.FooterText) Embed.setFooter({ text: this.FooterText });
        else if (this.FooterIcon) Embed.setFooter({ iconURL: this.FooterIcon });

        if (this.AuthorName && this.AuthorIcon) Embed.setAuthor({ name: this.AuthorName, iconURL: this.AuthorIcon });
        else if (this.AuthorName) Embed.setAuthor({ name: this.AuthorName });
        else if (this.AuthorIcon) Embed.setAuthor({ iconURL: this.AuthorIcon });

        this.Fields?.forEach(f => {
            Embed.addFields({ name: f.Name, value: f.Value, inline: f.Inline })
        })

        return Embed
    }
}

/**@param {embedLayout[]} embedOptions */
const createEmbed = (embedOptions) => embedOptions.map(embed => new EmbedCreator(embed));

module.exports = { createEmbed }