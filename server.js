const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const RaspberryPiController = require('./index');
const config = require('./config.json');

// Allow environment variables to override configured credentials
const AUTH_USER = process.env.WEB_USER || config.web_interface.auth.username;
const AUTH_PASS = process.env.WEB_PASS || config.web_interface.auth.password;

const app = express();
const controller = new RaspberryPiController();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
    if (config.api.cors) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    }
    next();
});

// Rate limiting for API routes
if (config.api.rate_limit && config.api.rate_limit.enabled) {
    const limiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: config.api.rate_limit.requests_per_minute
    });
    app.use('/api', limiter);
}

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

    const expectedUser = process.env.WEB_USER || config.web_interface.auth.username;
    const expectedPass = process.env.WEB_PASS || config.web_interface.auth.password;

    if (username === expectedUser && password === expectedPass) {
        next();
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
}

// API Routes
app.get('/api/system/info', basicAuth, async (req, res) => {
    try {
        const info = await controller.getSystemInfo();
        res.json({ success: true, data: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/system/temperature', basicAuth, async (req, res) => {
    try {
        const temp = await controller.getCPUTemperature();
        res.json({ success: true, data: { temperature: temp } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/system/memory', basicAuth, async (req, res) => {
    try {
        const memory = await controller.getMemoryInfo();
        res.json({ success: true, data: { memory } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/system/disk', basicAuth, async (req, res) => {
    try {
        const disk = await controller.getDiskUsage();
        res.json({ success: true, data: { disk } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/wifi/status', basicAuth, async (req, res) => {
    try {
        const status = await controller.getWiFiStatus();
        res.json({ success: true, data: { status } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/wifi/scan', basicAuth, async (req, res) => {
    try {
        const networks = await controller.scanWiFi();
        res.json({ success: true, data: { networks } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/gpio/:pin', basicAuth, async (req, res) => {
    try {
        const pin = req.params.pin;
        const state = await controller.getGPIO(pin);
        res.json({ success: true, data: { pin, state } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/gpio/:pin', basicAuth, async (req, res) => {
    try {
        const pin = req.params.pin;
        const { state } = req.body;
        const result = await controller.setGPIO(pin, state);
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/service/:name/status', basicAuth, async (req, res) => {
    try {
        const serviceName = req.params.name;
        const status = await controller.getServiceStatus(serviceName);
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/service/:name/:action', basicAuth, async (req, res) => {
    try {
        const serviceName = req.params.name;
        const action = req.params.action;
        const result = await controller.controlService(serviceName, action);
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/system/reboot', basicAuth, async (req, res) => {
    try {
        const result = await controller.reboot();
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/system/shutdown', basicAuth, async (req, res) => {
    try {
        const result = await controller.shutdown();
        res.json({ success: true, data: { message: result } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start the server
const PORT = config.web_interface.port || 3000;
const HOST = config.web_interface.host || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🌐 MASTERBOT Web Interface running on http://${HOST}:${PORT}`);
    console.log(`🔧 API available on http://${HOST}:${PORT}/api`);
    console.log(`💡 Access the dashboard at http://${HOST}:${PORT}`);
    if (config.web_interface.auth.enabled) {
        console.log(`🔐 Authentication enabled - Username: ${AUTH_USER}`);
    }
});

