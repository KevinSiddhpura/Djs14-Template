const { ApplicationCommandType, ApplicationCommandOptionType, Colors } = require("discord.js");
const { Command, commandCollection } = require("../../../handlers/helpers/command");
const { reloadCommands, reloadEvents, reloadConfig } = require("../../../handlers/utils");
const { createMessage } = require("../../../handlers/helpers/createMessage");

new Command({
    enabled: true,
    name: "reload",
    description: "Reload events and commands",
    category: "Dev",
    type: ApplicationCommandType.ChatInput,
    options: [{
        type: ApplicationCommandOptionType.Subcommand,
        name: "commands",
        description: "Reload commands"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "events",
        description: "Reload events"
    }, {
        type: ApplicationCommandOptionType.Subcommand,
        name: "config",
        description: "Reload config"
    }],
    devOnly: true,
    runSlash: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case "commands": {
                await reloadCommands()
                    .then(() => {
                        interaction.editReply(createMessage({
                            embeds: [{
                                Title: "Reload Commands",
                                Color: Colors.Aqua,
                                Description: `> Successfully reloaded **${commandCollection.size}** commands.`,
                                FooterText: `Requested by ${interaction.user.username}`,
                                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                                Timestamp: true
                            }],
                        }))
                    }).catch(err => {
                        interaction.editReply(createMessage({
                            embeds: [{
                                Title: "Reload Commands",
                                Color: Colors.Red,
                                Description: `> Something went wrong while reloading commands. \n- ${err}`,
                                FooterText: `Requested by ${interaction.user.username}`,
                                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                                Timestamp: true
                            }],
                        }))
                    })

                break;
            }

            case "events": {
                await reloadEvents()
                    .then(() => {
                        interaction.editReply(createMessage({
                            embeds: [{
                                Title: "Reload Events",
                                Color: Colors.Aqua,
                                Description: `> Successfully reloaded client events.`,
                                FooterText: `Requested by ${interaction.user.username}`,
                                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                                Timestamp: true
                            }],
                        }))
                    })
                    .catch(err => {
                        interaction.editReply(createMessage({
                            embeds: [{
                                Title: "Reload Events",
                                Color: Colors.Red,
                                Description: `> Something went wrong while reloading events. \n- ${err}`,
                                FooterText: `Requested by ${interaction.user.username}`,
                                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                                Timestamp: true
                            }],
                        }))
                    })

                break;
            }

            case "config": {
                await reloadConfig()
                    .then(() => {
                        interaction.editReply(createMessage({
                            embeds: [{
                                Title: "Reload Config",
                                Color: Colors.Aqua,
                                Description: `> Successfully reloaded config.`,
                                FooterText: `Requested by ${interaction.user.username}`,
                                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                                Timestamp: true
                            }],
                        }))
                    })
                    .catch(err => {
                        interaction.editReply(createMessage({
                            embeds: [{
                                Title: "Reload Events",
                                Color: Colors.Red,
                                Description: `> Something went wrong while config. \n- ${err}`,
                                FooterText: `Requested by ${interaction.user.username}`,
                                FooterIcon: interaction.user.displayAvatarURL({ dynamic: true }),
                                Timestamp: true
                            }],
                        }))
                    });

                break;
            }
        }
    }
})