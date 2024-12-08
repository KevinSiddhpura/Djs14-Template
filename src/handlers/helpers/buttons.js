const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");

/**
 * @typedef {Object} ButtonLayout
 * @property {string} Label - The label of the button.
 * @property {string} Emoji - The emoji of the button.
 * @property {string} Style - The style of the button.
 * @property {boolean} Disabled - Whether the button is disabled.
 * @property {string} CustomID - The custom ID of the button.
 * @property {string} URL - The URL of the button (for link buttons).
 */

/**
 * Class representing a Discord button.
 */
class Buttons {
    /**
     * Create a button.
     * @param {ButtonLayout} options - The options for the button.
     * @throws Will throw an error if required properties are missing.
     */
    constructor(options) {
        this.label = options.Label;
        this.emoji = options.Emoji;
        this.disabled = options.Disabled || false;
        this.customId = options.CustomID;
        this.url = options.URL;
        this.style = options.Style?.toLowerCase() || (this.url ? "link" : "blurple");
        
        this.style = this.resolveStyle();
        this.validateOptions();

        this.button = new ButtonBuilder();
        this.setButtonProperties();

        return this.button;
    }

    /**
     * Resolve the style of the button.
     * @returns {ButtonStyle} The resolved button style.
     */
    resolveStyle() {
        const styleMap = {
            blurple: ButtonStyle.Primary,
            primary: ButtonStyle.Primary,
            purple: ButtonStyle.Primary,
            success: ButtonStyle.Success,
            green: ButtonStyle.Success,
            gray: ButtonStyle.Secondary,
            grey: ButtonStyle.Secondary,
            secondary: ButtonStyle.Secondary,
            red: ButtonStyle.Danger,
            danger: ButtonStyle.Danger,
            url: ButtonStyle.Link,
            link: ButtonStyle.Link
        };
        return styleMap[this.style];
    }

    /**
     * Validate the button options.
     * @throws Will throw an error if required properties are missing.
     */
    validateOptions() {
        if (this.style === ButtonStyle.Link && !this.url) {
            throw new Error("URL is required for link buttons.");
        }
        if (this.style === ButtonStyle.Link) {
            this.customId = null;
        }
        if (this.style !== ButtonStyle.Link && !this.customId) {
            throw new Error("Custom ID is required for buttons.");
        }
        if (this.style !== ButtonStyle.Link && !this.emoji && !this.label) {
            throw new Error("Label/Emoji is required for buttons.");
        }
    }

    /**
     * Set the properties of the button.
     */
    setButtonProperties() {
        if (this.label) this.button.setLabel(this.label);
        if (this.emoji) this.button.setEmoji(this.emoji);
        if (this.style) this.button.setStyle(this.style);
        if (this.disabled) this.button.setDisabled(this.disabled);
        if (this.customId) this.button.setCustomId(this.customId);
        if (this.url) this.button.setURL(this.url);
    }

    /**
     * Create one or multiple buttons.
     * @param {ButtonLayout | ButtonLayout[]} buttons - The button layout or an array of button layouts.
     * @returns {ButtonBuilder | ButtonBuilder[]} The created button(s).
     */
    static createButtons(buttons) {
        if (!Array.isArray(buttons)) {
            return new Buttons(buttons);
        }
        return buttons.map(button => new Buttons(button));
    }

    /**
     * Create an action row with buttons.
     * @param {ButtonLayout[]} buttons - An array of button layouts.
     * @returns {ActionRowBuilder} The created action row with buttons.
     */
    static createButtonRow(buttons) {
        const row = new ActionRowBuilder();
        const buttonArray = Buttons.createButtons(buttons);
        buttonArray.forEach(button => row.addComponents(button));
        return row;
    }
}

module.exports = Buttons;