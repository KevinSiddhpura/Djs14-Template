const config = require("../../config.json");
const logger = require("./logger");
const axios = require("axios");

const PANEL_URL = process.env.PANEL_URL;
const SERVER_ID = process.env.SERVER_ID;
const PTERO_KEY = process.env.PTERO_KEY;

if (!config.pteroManager.enabled) return;

module.exports = {
    getInfo: async (serverId = SERVER_ID) => {
        try {
            const response = await axios.get(`${PANEL_URL}/api/client/servers/${serverId}`, {
                headers: { 'Authorization': `Bearer ${PTERO_KEY}` }
            });

            if (response) {
                let data = response.data;
                let attri = data.attributes;
                return {
                    type: data.object,
                    isOwner: attri.server_owner,
                    identifier: attri.identifier,
                    internalId: attri.internal_id,
                    uuid: attri.uuid,
                    name: attri.name,
                    node: attri.node,
                    is_node_under_maintenance: attri.is_node_under_maintenance,
                    description: attri.description,
                    memory: attri.limits.memory,
                    disk: attri.limits.disk,
                    cpu: attri.limits.cpu,
                    threads: attri.limits.threads,
                    oom_disabled: attri.oom_disabled,
                    invocation: attri.invocation,
                    dockerImage: attri.docker_image,
                    egg_features: attri.egg_features,
                    databases: attri.feature_limits.databases,
                    backups: attri.feature_limits.backups,
                    status: attri.status,
                    is_suspended: attri.is_suspended,
                    is_installing: attri.is_installing,
                    is_transferring: attri.is_transferring,
                }
            }
        } catch (error) {
            logger.error(error);
            return false;
        }
    },
    getStatus: async (serverId = SERVER_ID) => {
        try {
            const response = await axios.get(`${PANEL_URL}/api/client/servers/${serverId}/resources`, {
                headers: { 'Authorization': `Bearer ${PTERO_KEY}` }
            });

            if (response) {
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
            const response = await axios.get(`${PANEL_URL}/api/client/servers/${serverId}/resources`, {
                headers: { 'Authorization': `Bearer ${PTERO_KEY}` }
            });

            if (response) {
                let data = response.data.attributes;
                let res = data.resources;

                return {
                    current_state: data.current_state,
                    is_suspended: data.is_suspended,
                    memoryBytes: res.memory_bytes,
                    diskBytes: res.disk_bytes,
                    cpuAbsolute: res.cpu_absolute,
                    uptime: res.uptime,
                    network_rxBytes: res.network_rx_bytes,
                    network_txBytes: res.network_tx_bytes    
                };
            }
        } catch (error) {
            logger.error(error);
            return false;
        }
    }
}