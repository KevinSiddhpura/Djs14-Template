const config = {
    // Put in developer IDs here
    devs: [],
    
    // Put in server ID here
    serverID: "-",
    
    // Get more info on what's starting
    extraStartUpLogs: true,
    
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
        enabled: true,
        defaultRoles: [ "Members" ],

        // Give previous stored role
        // Triggers when user joins back
        giveOldRoles: true
    }
}

module.exports = config;