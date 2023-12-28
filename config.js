module.exports = {
    // Put bot id here
    botID: "-",
    // Put in developer IDs here
    devs: [],
    // Put in server ID here
    serverID: "-",
    // Get more info on what's starting
    extraStartUpLogs: false,
    // Music Support
    musicSupport: {
        enabled: false,
        nodes: [{
            host: "-",
            port: 0,
            password: "-",
            retryAmount: 5,
            retryDelay: 5000
        }],
        spotify: {
            enabled: true,
            // Get id from https://developer.spotify.com/documentation/general/guides/authorization/app-settings/
            clientID: "-",
            // Get secret from https://developer.spotify.com/dashboard/applications
            clientSecret: "-",
        }
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
        enabled: true,
        defaultRoles: [ "Members" ],
        // Give previous stored role
        // Triggers when user joins back
        giveOldRoles: false
    }
}