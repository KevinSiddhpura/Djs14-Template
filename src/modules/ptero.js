const config = require("../../config.json");
const logger = require("./logger");
const axios = require("axios");

const PANEL_URL = process.env.PANEL_URL;
const SERVER_ID = process.env.SERVER_ID;
const PTERO_KEY = process.env.PTERO_KEY;

if (!config.pteroManager.enabled) return;

module.exports = {
    getStatus: async (serverId = SERVER_ID) => {
        try {
            const response = await axios.get(`${PANEL_URL}/api/client/servers/${serverId}/resources`, {
                headers: { 'Authorization': `Bearer ${PTERO_KEY}` }
            });
            
            if(response) {
                return response.data.attributes.current_state;
            }
        } catch (error) {
            logger.error(error);
            return false;
        }
    },
    changeState: async (command, serverId = SERVER_ID) => {
        try {
            const response = await axios.post(`${PANEL_URL}/api/client/servers/${serverId}/power`, {
                signal: command,
            }, {
                headers: { 'Authorization': `Bearer ${PTERO_KEY}` }
            });

            return response.status;
        } catch (e) {
            logger.error(e);
            return false;
        }
    },
    getResources: async (serverId = SERVER_ID) => {
        try {
            const res = await axios.get(`${PANEL_URL}/api/servers/${serverId}/resources`, {
                headers: {
                    Authorization: `Bearer ${PTERO_KEY}`
                }
            });

            return res.data.attributes;
        } catch (e) {
            logger.error(e);
            return false;
        }
    }
}