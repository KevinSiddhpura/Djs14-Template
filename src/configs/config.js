module.exports = {
    // Put bot id here
    botID: "1133838030990491788",
    // Put in developer IDs here
    devs: ["528627987667615755"],
    // MultiGuild this registers commands in all the servers
    MultiGuild: false,
    // Put in server ID here
    serverID: "923216789956100146",
    // Get more info on what's starting
    extraStartUpLogs: false,
    // PasteBin URL
    pastebinURL: "https://paste.kwin.in",
    // Connect to MSQL
    createDbConnection: true,
    // Manage your ptero server
    enablePteroManager: true,
    // Enable OpenAI support
    // Requires a API key to be configured in .env file
    enableOpenAiSupport: true,
    // Server mute role [id/name]
    mutedRole: "Team 1",
    // Auto give roles
    userJoinRoles: {
        enabled: true,
        defaultRoles: ["Members"],
        // Give previous stored role
        // Triggers when user joins back
        giveOldRoles: true
    }
}