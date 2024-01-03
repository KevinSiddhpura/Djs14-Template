module.exports = {
    // Put bot id here
    botID: "-",
    // Put in developer IDs here
    devs: [],
    // MultiGuild this registers commands in all the servers
    MultiGuild: false,
    // Put in server ID here
    serverID: "-",
    // Get more info on what's starting
    extraStartUpLogs: false,
    // PasteBin URL
    pastebinURL: "-",
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
    // Suggestion System
    suggestionSystem: {
        enabled: false,
        // Configure drop channels
        channels: {
            suggestion: "suggestions",
            accepted: "accepted",
            rejected: "rejected",
            pending: "pending"
        },
        // Set false for no cooldown
        cooldown: "6h",
        // Enable or disable showing voter details
        showVoters: true,
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
        defaultRoles: ["Members"],
        // Give previous stored role
        // Triggers when user joins back
        giveOldRoles: false
    },
    // Level System
    levelSystem: {
        enabled: false,
        // XP per message
        minXpPerMessage: 1,
        maxXpPerMessage: 4,
        // Multipliers
        roleXpMultiplier: {
            enabled: true,
            roles: [
                { role: "R1", multiplier: "1.5" },
                { role: "R2", multiplier: "2" }
            ],
        },
        // Level:XP requirement
        levelXp: {
            1: 100,
            2: 200,
            3: 300,
            4: 400,
            5: 500,
            6: 600,
            7: 700,
            10: 800,
        },
        // Role rewards
        roleRewards: {
            enabled: true,
            reward: [
                { level: 1, role: "Level 1" },
                { level: 2, role: "Level 2" },
                { level: 3, role: "Level 3" },
                { level: 4, role: "Level 4" },
                { level: 5, role: "Level 5" },
                { level: 6, role: "Level 6" },
                { level: 7, role: "Level 7" },
                { level: 8, role: "Level 8" },
                { level: 9, role: "Level 9" },
                { level: 10, role: "Level 10" },
            ]
        },
    }
}