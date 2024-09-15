const { ButtonBuilder, Message, ActionRowBuilder } = require("discord.js");
const { embedLayout } = require("./helpers/embed");
const { paginationButtons } = require("../config");
const logger = require("./helpers/logger");

const IMessage = {
    /** @type {string[] | null} */
    content: null,
    /** @type {embedLayout[] | null} */
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
     * @param {Message} message 
     * @param {IMessage[]} messageOptions 
     * @param {string | string[]} usersAllowed
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

        if (!usersAllowed) {
            logger.error("Pagination: Users allowed are not provided");
            return;
        }

        this.pages = messageOptions
        this.message = message;
        this.usersAllowed = usersAllowed;
        this.currentPageIndex = 0;
    }

    getComponents() {
        const row = new ActionRowBuilder();
        if (paginationButtons.toFirst.showButton) {
            const firstButton = buttonSettings.toFirst;
            if (this.currentPageIndex == 0) firstButton.setDisabled(true); else firstButton.setDisabled(false);
            row.addComponents(firstButton);
        }

        if (paginationButtons.toPrevious.showButton) {
            const previousButton = buttonSettings.toPrevious;
            if (this.currentPageIndex == 0) previousButton.setDisabled(true); else previousButton.setDisabled(false);
            row.addComponents(previousButton);
        }

        if (paginationButtons.toNext.showButton) {
            const nextButton = buttonSettings.toNext;
            if (this.currentPageIndex == this.pages.length - 1) nextButton.setDisabled(true); else nextButton.setDisabled(false);
            row.addComponents(nextButton);
        }

        if (paginationButtons.toLast.showButton) {
            const lastButton = buttonSettings.toLast;
            if (this.currentPageIndex == this.pages.length - 1) lastButton.setDisabled(true); else lastButton.setDisabled(false);
            row.addComponents(lastButton);
        }

        return row;
    }

    async paginate() {
        const filter = i => i.user.id === Array.isArray(this.usersAllowed) ? this.usersAllowed.includes(i.user.id) : i.user.id === this.usersAllowed;
        const collector = this.message.createMessageComponentCollector({ filter, time: 60000 * 10 });

        collector.on('collect', async (interaction) => {
            switch (interaction.customId) {
                case 'paginate-first':
                    this.currentPageIndex = 0;
                    break;

                case 'paginate-previous':
                    this.currentPageIndex = this.currentPageIndex > 0 ? this.currentPageIndex - 1 : 0;
                    break;

                case 'paginate-next':
                    this.currentPageIndex = this.currentPageIndex < this.pages.length - 1 ? this.currentPageIndex + 1 : this.pages.length - 1;
                    break;

                case 'paginate-last':
                    this.currentPageIndex = this.pages.length - 1;
                    break;

            }

            const row = this.getComponents();
            await interaction.update({
                content: this.pages[this.currentPageIndex].content || null,
                embeds: this.pages[this.currentPageIndex].embeds || null,
                components: [row],
            }).catch(logger.error);
        });


        collector.on('end', () => {
            this.message.edit({ components: [] }).catch(err => null);
        });

        await this.message.edit({
            content: this.pages[0].content || null,
            embeds: this.pages[0].embeds || null,
            components: [this.getComponents()],
        }).catch(logger.error);
    }
}

module.exports = { Pagination }