module.exports = {
    // Put bot id here
    botID: "-",
    // Put in developer IDs here
    devs: ["-"],
    // Put in server ID here
    serverID: "-",
    // Get more info on what's starting
    extraStartUpLogs: true,
    // Music Support
    musicSupport: {
        enabled: false,
        nodes: [{
            name: "-",
            host: "-",
            port: 0,
            password: "-",
            secure: false,
        }],
    },
    // Connect to MSQL
    createDbConnection: false,
    // Manage your ptero server
    enablePteroManager: false,
    // Enable OpenAI support
    // Requires a API key to be configured in .env file
    enableOpenAiSupport: false,
    // Server mute role [id/name]
    mutedRole: "Muted",
    // Auto give roles
    userJoinRoles: {
        enabled: false,
        defaultRoles: [ "Members"],
        // Give previous stored role
        // Triggers when user joins back
        giveOldRoles: false
    }
}