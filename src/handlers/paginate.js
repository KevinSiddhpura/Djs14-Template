const { ButtonBuilder, Message, ActionRowBuilder } = require("discord.js");
const { paginationButtons } = require("../config");
const logger = require("./helpers/logger");
const { createEmbeds } = require("./helpers/embed");

/**
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

const IMessage = {
    /** @type {string[] | null} */
    content: null,
    /** @type {EmbedLayout[] | null} */
    embeds: null,
    /** @type {boolean} */
    ephemeral: null,
};

let buttonSettings = {
    toLast: new ButtonBuilder().setCustomId("paginate-last").setEmoji(paginationButtons.toLast.emoji).setStyle(paginationButtons.toLast.style).setLabel(paginationButtons.toLast?.label || " "),
    toNext: new ButtonBuilder().setCustomId("paginate-next").setEmoji(paginationButtons.toNext.emoji).setStyle(paginationButtons.toNext.style).setLabel(paginationButtons.toNext?.label || " "),
    toFirst: new ButtonBuilder().setCustomId("paginate-first").setEmoji(paginationButtons.toFirst.emoji).setStyle(paginationButtons.toFirst.style).setLabel(paginationButtons.toFirst?.label || " "),
    toPrevious: new ButtonBuilder().setCustomId("paginate-previous").setEmoji(paginationButtons.toPrevious.emoji).setStyle(paginationButtons.toPrevious.style).setLabel(paginationButtons.toPrevious?.label || " "),
};

class Pagination {
    /**
     * Create a new pagination object.
     * @param {Message} message - The message object where the pagination will take place.
     * @param {IMessage[]} messageOptions - An array of message options (pages) to paginate through.
     * @param {string | string[]} usersAllowed - A user ID or array of user IDs allowed to interact with pagination.
     */
    constructor(message, messageOptions, usersAllowed) {
        if (!message) {
            logger.error("Pagination: Message object is not provided");
            return;
        }

        if (!messageOptions) {
            logger.error("Pagination: Message options are not provided");
            return;
        }

        for (const obj of messageOptions) {
            if (obj.embeds == null) continue;
            messageOptions[0].embeds = createEmbeds(obj.embeds);
        }

        if (!usersAllowed) {
            logger.error("Pagination: Users allowed are not provided");
            return;
        }

        this.pages = messageOptions;
        this.message = message;
        this.usersAllowed = usersAllowed;
        this.currentPageIndex = 0;
    }

    /**
     * Generates the button components for pagination, enabling/disabling based on the current page.
     * @returns {ActionRowBuilder} The action row with pagination buttons.
     */
    getComponents() {
        const row = new ActionRowBuilder();

        // Handle first page button
        if (paginationButtons.toFirst.showButton) {
            const firstButton = buttonSettings.toFirst.setDisabled(this.currentPageIndex === 0);
            row.addComponents(firstButton);
        }

        // Handle previous page button
        if (paginationButtons.toPrevious.showButton) {
            const previousButton = buttonSettings.toPrevious.setDisabled(this.currentPageIndex === 0);
            row.addComponents(previousButton);
        }

        // Handle next page button
        if (paginationButtons.toNext.showButton) {
            const nextButton = buttonSettings.toNext.setDisabled(this.currentPageIndex === this.pages.length - 1);
            row.addComponents(nextButton);
        }

        // Handle last page button
        if (paginationButtons.toLast.showButton) {
            const lastButton = buttonSettings.toLast.setDisabled(this.currentPageIndex === this.pages.length - 1);
            row.addComponents(lastButton);
        }

        return row;
    }

    /**
     * Starts the pagination process by setting up the collector for button interactions and updating the message accordingly.
     */
    async paginate() {
        const filter = (i) => Array.isArray(this.usersAllowed) ? this.usersAllowed.includes(i.user.id) : i.user.id === this.usersAllowed;
        const collector = this.message.createMessageComponentCollector({ filter, time: 60000 * 10 }); // Collect for 10 minutes

        collector.on('collect', async (interaction) => {
            switch (interaction.customId) {
                case 'paginate-first':
                    this.currentPageIndex = 0;
                    break;
                case 'paginate-previous':
                    this.currentPageIndex = Math.max(this.currentPageIndex - 1, 0);
                    break;
                case 'paginate-next':
                    this.currentPageIndex = Math.min(this.currentPageIndex + 1, this.pages.length - 1);
                    break;
                case 'paginate-last':
                    this.currentPageIndex = this.pages.length - 1;
                    break;
            }

            const row = this.getComponents();
            await interaction.update({
                content: this.pages[this.currentPageIndex].content || null,
                embeds: this.pages[this.currentPageIndex].embeds || [],
                components: [row],
            }).catch(logger.error);
        });

        collector.on('end', () => {
            this.message.edit({ components: [] }).catch(() => null); // Clear buttons after pagination ends
        });

        // Initialize pagination with the first page
        await this.message.edit({
            content: this.pages[0].content || null,
            embeds: this.pages[0].embeds || [],
            components: [this.getComponents()],
        }).catch(logger.error);
    }
}

module.exports = Pagination