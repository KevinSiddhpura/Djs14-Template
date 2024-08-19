const { Collection, ApplicationCommandType, ApplicationCommandOptionType, ChannelType, Client, ChatInputCommandInteraction, Message, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } = require("discord.js");
const logger = require("./logger");

const commandCollection = new Collection();

const choicesLayout = {
    /** @type {string} */
    name: null,
    /** @type {string} */
    value: null
}

const optionsLayout = {
    /** @type {ApplicationCommandOptionType} */
    type: null,
    /** @type {string} */
    name: null,
    /** @type {string} */
    description: null,
    /** @type {boolean} */
    required: null,
    /** @type {choicesLayout[]} */
    choices: [],
    /** @type {ChannelType[]} */
    channelTypes: [],
    /** @type {boolean} */
    autocomplete: null
};

const commandLayout = {
    /** @type {boolean} */
    enabled: null,
    /** @type {string} */
    category: null,
    /** @type {string} */
    name: null,
    /** @type {string} */
    description: null,
    /** @type {optionsLayout[]} */
    options: [],
    /** @type {ApplicationCommandType} */
    type: null,
    /** @type {string[]} */
    aliases: [],
    /** @type {boolean} */
    devOnly: null,
    /** @type {boolean} */
    adminOnly: null,
    /** @type {string[]} */
    allowedRoles: [],
    /** @type {string[]} */
    allowedChannels: [],

    /**
     * To run a slash command
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */

    runSlash: async (client, interaction) => { },

    /**
    * To run a context menu command (message)
    * @param {Client} client 
    * @param {MessageContextMenuCommandInteraction} interaction 
    */

    runContextMessage: async (client, interaction) => { },

    /**
    * To run a context menu command (user)
    * @param {Client} client 
    * @param {UserContextMenuCommandInteraction} interaction 
    */

    runContextUser: async (client, interaction) => { },

    /**
     * To run a prefix command
     * @param {Client} client 
     * @param {Message} message 
     * @param {Array} args 
     */

    runLegacy: async (client, message, args) => { }
};

class Command {
    /** @param {commandLayout} commandOptions */
    constructor(commandOptions) {
        this.name = commandOptions.name;
        if (!this.name) return logger.error(`Missing command name`);
        if (commandCollection.has(this.name)) return logger.error(`Duplicate command name: ${this.name}`);

        this.category = commandOptions.category || null;
        if (!this.category) return logger.error(`Missing command category for ${this.name}`);

        this.enabled = commandOptions.enabled || true;
        this.description = commandOptions.description || null;
        this.type = commandOptions.type || ApplicationCommandType.ChatInput;

        if (!this.description && this.type == ApplicationCommandType.ChatInput) return logger.error(`Missing command description for ${this.name}`);
        if (this.type == ApplicationCommandType.Message || this.type == ApplicationCommandType.User) this.description = null;

        this.aliases = commandOptions.aliases || [];
        this.devOnly = commandOptions.devOnly || false;
        this.adminOnly = commandOptions.adminOnly || false;
        this.allowedRoles = commandOptions.allowedRoles || [];
        this.allowedChannels = commandOptions.allowedChannels || [];

        this.runSlash = commandOptions.runSlash || null;
        this.runLegacy = commandOptions.runLegacy || null;
        if (this.type == ApplicationCommandType.ChatInput && (!this.runSlash && !this.runLegacy)) return logger.error(`Missing command fun function for ${this.name}`);

        this.runContextMessage = commandOptions.runContextMessage || null;
        if (this.type == ApplicationCommandType.Message && !this.runContextMessage) return logger.error(`Missing command run context message function for ${this.name}`);

        this.runContextUser = commandOptions.runContextUser || null;
        if (this.type == ApplicationCommandType.User && !this.runContextUser) return logger.error(`Missing command run context user function for ${this.name}`);

        this.options = commandOptions.options?.map((o) => ({
            type: o.type,
            name: o.name,
            description: o.description,
            required: o.required || false,
            choices: o.choices || [],
            channelTypes: o.channelTypes || [],
            autocomplete: o.autocomplete || false,
            options: o.options || []
        })) || [];

        commandCollection.set(this.name, this);
    }
}

module.exports = { Command, commandCollection };