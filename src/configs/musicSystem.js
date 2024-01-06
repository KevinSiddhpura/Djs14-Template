module.exports = {
    enabled: true,
    nodes: [{
        host: "lava.kwin.in",
        port: 4057,
        password: "R8d2v63hzXxKYz",
        retryAmount: 5,
        retryDelay: 5000
    }],
    spotify: {
        enabled: true,
        // Get id from https://developer.spotify.com/documentation/general/guides/authorization/app-settings/
        clientID: "44b657dbf767422ba2ca0cbf6a4dc494",
        // Get secret from https://developer.spotify.com/dashboard/applications
        clientSecret: "5ee98f1c9f6e4b6fa9d1ac52d2232774",
    }
}