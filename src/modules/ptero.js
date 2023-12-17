const config = require("../../config.json");
const logger = require("./logger");
const axios = require("axios");

const PANEL_URL = process.env.PANEL_URL;
const SERVER_ID = process.env.SERVER_ID;
const PTERO_KEY = process.env.PTERO_KEY;

if (!config.pteroManager.enabled) {
    logger.warn('Pterodactyl Manager is disabled in the config.');
    return;
}

const axiosInstance = axios.create({
    baseURL: `${PANEL_URL}/api/client/servers/`,
    headers: { 'Authorization': `Bearer ${PTERO_KEY}` }
});

async function makeApiRequest(endpoint, method = 'get', data = {}) {
    try {
        const response = await axiosInstance[method](endpoint, data);
        return response;
    } catch (error) {
        logger.error(`Error in ${endpoint}: ${error.message}`);
        return false;
    }
}

const getInfo = async (serverId = SERVER_ID) => {
    const d = await makeApiRequest(`${serverId}`);
    if (d) {
        const attri = d.data.attributes;
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
        };
    }
    return false;
}

const getStatus = async (serverId = SERVER_ID) => {
    const d = await makeApiRequest(`${serverId}/resources`);
    if (data) {
        return d.data.attributes.current_state;
    }
    return false;
}

const changeState = async (command, serverId = SERVER_ID) => {
    const result = await makeApiRequest(`${serverId}/power`, 'post', { signal: command });
    if(result && result.status == 204) {
        return true;
    }
    return false;
}

const getResources = async(serverId = SERVER_ID) => {
    const d = await makeApiRequest(`${serverId}/resources`);
    if (d) {
        const res = d.data.attributes.resources;
        return {
            memoryBytes: res.memory_bytes,
            diskBytes: res.disk_bytes,
            cpuAbsolute: res.cpu_absolute,
            uptime: res.uptime,
            network_rxBytes: res.network_rx_bytes,
            network_txBytes: res.network_tx_bytes
        };
    }
    return false;
}

module.exports = { getInfo, getStatus, changeState, getResources };
