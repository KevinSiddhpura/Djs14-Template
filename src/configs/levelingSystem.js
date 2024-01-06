module.exports = {
    enabled: true,
    // XP per message
    minXpPerMessage: 1,
    maxXpPerMessage: 5,
    // Multipliers
    roleXpMultiplier: {
        enabled: true,
        roles: [
            { role: "R1", multiplier: "2" },
            { role: "R2", multiplier: "3" }
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
        ]
    },
}