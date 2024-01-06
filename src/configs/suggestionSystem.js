module.exports = {
    enabled: true,
    // Configure drop channels
    channels: {
        suggestion: "suggestions",
        accepted: "accepted",
        rejected: "rejected",
        pending: "on-hold"
    },
    // Set false for no cooldown
    cooldown: "6h",
    // Enable or disable showing voter details
    showVoters: true,
    // Roles who can access buttons an menus
    manageAccess: ["Mod", "Admin"]

}