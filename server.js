const express = require('express');
const path = require('path');
const RaspberryPiController = require('./index');
const config = require('./config.json');

const controller = new RaspberryPiController();

// Express instances
const dashboardApp = express();
const apiRouter = express.Router();

// API Middleware
apiRouter.use(express.json());
apiRouter.use((req, res, next) => {
    if (config.api.cors) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    }
    next();
});

// Basic authentication middleware
function basicAuth(req, res, next) {
    if (!config.web_interface.auth.enabled) {
        return next();
    }

    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];

    if (username === config.web_interface.auth.username && password === config.web_interface.auth.password) {
        next();
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
}

// API Routes
apiRouter.get('/system/info', basicAuth, async (req, res) => {
    try {
        const info = await controller.getSystemInfo();
        res.json({ success: true, data: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/system/temperature', basicAuth, async (req, res) => {
    try {
        const temp = await controller.getCPUTemperature();
        res.json({ success: true, data: { temperature: temp } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/system/memory', basicAuth, async (req, res) => {
    try {
        const memory = await controller.getMemoryInfo();
        res.json({ success: true, data: { memory } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/system/disk', basicAuth, async (req, res) => {
    try {
        const disk = await controller.getDiskUsage();
        res.json({ success: true, data: { disk } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/wifi/status', basicAuth, async (req, res) => {
    try {
        const status = await controller.getWiFiStatus();
        res.json({ success: true, data: { status } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/wifi/scan', basicAuth, async (req, res) => {
    try {
        const networks = await controller.scanWiFi();
        res.json({ success: true, data: { networks } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/gpio/:pin', basicAuth, async (req, res) => {
    try {
        const pin = req.params.pin;
        const state = await controller.getGPIO(pin);
        res.json({ success: true, data: { pin, state } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.post('/gpio/:pin', basicAuth, async (req, res) => {
    try {
        const pin = req.params.pin;
        const { state } = req.body;
        const result = await controller.setGPIO(pin, state);
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/service/:name/status', basicAuth, async (req, res) => {
    try {
        const serviceName = req.params.name;
        const status = await controller.getServiceStatus(serviceName);
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.post('/service/:name/:action', basicAuth, async (req, res) => {
    try {
        const serviceName = req.params.name;
        const action = req.params.action;
        const result = await controller.controlService(serviceName, action);
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.post('/system/reboot', basicAuth, async (req, res) => {
    try {
        const result = await controller.reboot();
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.post('/system/shutdown', basicAuth, async (req, res) => {
    try {
        const result = await controller.shutdown();
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mount API router on dashboard
dashboardApp.use('/api', apiRouter);

// Serve the main HTML page
dashboardApp.use(express.static('public'));
dashboardApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
dashboardApp.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start servers
const WEB_PORT = config.web_interface.port || 3000;
const HOST = config.web_interface.host || '0.0.0.0';

if (config.web_interface.enabled) {
    dashboardApp.listen(WEB_PORT, HOST, () => {
        console.log(`🌐 MASTERBOT Web Interface running on http://${HOST}:${WEB_PORT}`);
        console.log(`💡 Access the dashboard at http://${HOST}:${WEB_PORT}`);
        console.log(`🔧 API available on http://${HOST}:${WEB_PORT}/api`);
        if (config.web_interface.auth.enabled) {
            console.log(`🔐 Authentication enabled - Username: ${config.web_interface.auth.username}`);
        }
    });
}

if (config.api.enabled) {
    const API_PORT = config.api.port || 3001;
    const apiApp = express();
    apiApp.use('/api', apiRouter);
    apiApp.listen(API_PORT, HOST, () => {
        console.log(`🚀 MASTERBOT API running on http://${HOST}:${API_PORT}/api`);
    });
}

