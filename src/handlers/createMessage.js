const { embedLayout, createEmbed } = require("./helpers/embed");

const IMessage = {
    /** @type {string[]} */
    content: null,
    /** @type {embedLayout[]} */
    embeds: null,
    /** @type {boolean} */
    ephemeral: null,
};

class MessageCreator {
    /** @param {IMessage} messageOptions */
    constructor(messageOptions) {
        this.content = messageOptions.content || null;
        this.embeds = messageOptions.embeds || null;
        this.ephemeral = messageOptions.ephemeral || false;

        const messageObject = {};

        if (this.ephemeral) {
            Object.assign(messageObject, { ephemeral: true });
        }

        if (this.content) {
            Object.assign(messageObject, { content: this.content });
        }

        if (this.embeds) {
            const embeds = createEmbed(this.embeds);
            Object.assign(messageObject, { embeds: embeds });
        };

        return messageObject;
    }
}

/**
 * @param {IMessage} messageOptions 
 */

const createMessage = (messageOptions) => new MessageCreator(messageOptions);

module.exports = createMessage;