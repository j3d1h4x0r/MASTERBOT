#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const config = require('./config.json');

class RaspberryPiController {
    constructor() {
        this.isRaspberryPi = this.detectRaspberryPi();
        this.wifiInterface =
            (config.raspberry_pi &&
                config.raspberry_pi.wifi &&
                config.raspberry_pi.wifi.interface) ||
            'wlan0';
        console.log(
            `🤖 MASTERBOT initialized on ${this.isRaspberryPi ? 'Raspberry Pi' : 'other system'}`
        );
    }

    detectRaspberryPi() {
        try {
            const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
            return cpuInfo.includes('Raspberry Pi');
        } catch (error) {
            return false;
        }
    }

    // System Information
    async getSystemInfo() {
        return new Promise((resolve, reject) => {
            const info = {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                uptime: os.uptime(),
                loadavg: os.loadavg(),
                totalmem: os.totalmem(),
                freemem: os.freemem(),
                cpus: os.cpus().length
            };

            if (this.isRaspberryPi) {
                exec('vcgencmd measure_temp', (error, stdout) => {
                    if (!error) {
                        info.temperature = stdout.trim();
                    }
                    resolve(info);
                });
            } else {
                resolve(info);
            }
        });
    }

    // GPIO Control
    async setGPIO(pin, state) {
        if (!this.isRaspberryPi) {
            throw new Error('GPIO control only available on Raspberry Pi');
        }

        return new Promise((resolve, reject) => {
            exec(`raspi-gpio set ${pin} ${state}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(`GPIO ${pin} set to ${state}`);
                }
            });
        });
    }

    async getGPIO(pin) {
        if (!this.isRaspberryPi) {
            throw new Error('GPIO control only available on Raspberry Pi');
        }

        return new Promise((resolve, reject) => {
            exec(`raspi-gpio get ${pin}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    // System Control
    async reboot() {
        if (!this.isRaspberryPi) {
            throw new Error('System control only available on Raspberry Pi');
        }

        return new Promise((resolve, reject) => {
            exec('sudo reboot', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve('System rebooting...');
                }
            });
        });
    }

    async shutdown() {
        if (!this.isRaspberryPi) {
            throw new Error('System control only available on Raspberry Pi');
        }

        return new Promise((resolve, reject) => {
            exec('sudo shutdown -h now', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve('System shutting down...');
                }
            });
        });
    }

    // WiFi Management
    async getWiFiStatus() {
        return new Promise((resolve, reject) => {
            exec(`iwconfig ${this.wifiInterface}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    async scanWiFi() {
        return new Promise((resolve, reject) => {
            exec(
                `sudo iwlist ${this.wifiInterface} scan | grep ESSID`,
                (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    const networks = stdout.split('\n')
                        .filter(line => line.includes('ESSID'))
                        .map(line => line.split('"')[1])
                        .filter(name => name && name.length > 0);
                    resolve(networks);
                }
            });
        });
    }

    // Service Management
    async getServiceStatus(serviceName) {
        return new Promise((resolve, reject) => {
            exec(`systemctl is-active ${serviceName}`, (error, stdout, stderr) => {
                resolve({
                    service: serviceName,
                    status: stdout.trim(),
                    active: stdout.trim() === 'active'
                });
            });
        });
    }

    async controlService(serviceName, action) {
        const validActions = ['start', 'stop', 'restart', 'enable', 'disable'];
        if (!validActions.includes(action)) {
            throw new Error(`Invalid action. Valid actions: ${validActions.join(', ')}`);
        }

        return new Promise((resolve, reject) => {
            exec(`sudo systemctl ${action} ${serviceName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(`Service ${serviceName} ${action} completed`);
                }
            });
        });
    }

    // Hardware Configuration
    async getCPUTemperature() {
        if (!this.isRaspberryPi) {
            throw new Error('CPU temperature only available on Raspberry Pi');
        }

        return new Promise((resolve, reject) => {
            exec('vcgencmd measure_temp', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    const temp = stdout.replace('temp=', '').trim();
                    resolve(temp);
                }
            });
        });
    }

    async getMemoryInfo() {
        return new Promise((resolve, reject) => {
            exec('free -h', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    async getDiskUsage() {
        return new Promise((resolve, reject) => {
            exec('df -h', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }
}

// CLI Interface
if (require.main === module) {
    const controller = new RaspberryPiController();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🤖 MASTERBOT - Raspberry Pi Controller');
        console.log('Usage: node index.js [command] [options]');
        console.log('\nAvailable commands:');
        console.log('  info          - Get system information');
        console.log('  temp          - Get CPU temperature');
        console.log('  memory        - Get memory usage');
        console.log('  disk          - Get disk usage');
        console.log('  wifi-status   - Get WiFi status');
        console.log('  wifi-scan     - Scan for WiFi networks');
        console.log('  gpio-set <pin> <state> - Set GPIO pin state');
        console.log('  gpio-get <pin> - Get GPIO pin state');
        console.log('  service-status <name> - Get service status');
        console.log('  service-control <name> <action> - Control service');
        console.log('  reboot        - Reboot system');
        console.log('  shutdown      - Shutdown system');
        return;
    }

    const command = args[0];

    (async () => {
        try {
            switch (command) {
                case 'info':
                    const info = await controller.getSystemInfo();
                    console.log('📊 System Information:');
                    console.log(JSON.stringify(info, null, 2));
                    break;
                
                case 'temp':
                    const temp = await controller.getCPUTemperature();
                    console.log(`🌡️  CPU Temperature: ${temp}`);
                    break;
                
                case 'memory':
                    const memory = await controller.getMemoryInfo();
                    console.log('💾 Memory Usage:');
                    console.log(memory);
                    break;
                
                case 'disk':
                    const disk = await controller.getDiskUsage();
                    console.log('💿 Disk Usage:');
                    console.log(disk);
                    break;
                
                case 'wifi-status':
                    const wifiStatus = await controller.getWiFiStatus();
                    console.log('📶 WiFi Status:');
                    console.log(wifiStatus);
                    break;
                
                case 'wifi-scan':
                    const networks = await controller.scanWiFi();
                    console.log('🔍 Available Networks:');
                    networks.forEach(network => console.log(`  - ${network}`));
                    break;
                
                case 'gpio-set':
                    if (args.length < 3) {
                        console.error('Usage: gpio-set <pin> <state>');
                        return;
                    }
                    const setResult = await controller.setGPIO(args[1], args[2]);
                    console.log(`⚡ ${setResult}`);
                    break;
                
                case 'gpio-get':
                    if (args.length < 2) {
                        console.error('Usage: gpio-get <pin>');
                        return;
                    }
                    const getResult = await controller.getGPIO(args[1]);
                    console.log(`⚡ GPIO ${args[1]}: ${getResult}`);
                    break;
                
                case 'service-status':
                    if (args.length < 2) {
                        console.error('Usage: service-status <service-name>');
                        return;
                    }
                    const serviceStatus = await controller.getServiceStatus(args[1]);
                    console.log(`🔧 Service Status:`, serviceStatus);
                    break;
                
                case 'service-control':
                    if (args.length < 3) {
                        console.error('Usage: service-control <service-name> <action>');
                        return;
                    }
                    const controlResult = await controller.controlService(args[1], args[2]);
                    console.log(`🔧 ${controlResult}`);
                    break;
                
                case 'reboot':
                    const rebootResult = await controller.reboot();
                    console.log(`🔄 ${rebootResult}`);
                    break;
                
                case 'shutdown':
                    const shutdownResult = await controller.shutdown();
                    console.log(`⏻ ${shutdownResult}`);
                    break;
                
                default:
                    console.error(`Unknown command: ${command}`);
                    console.log('Run without arguments to see available commands.');
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    })();
}

module.exports = RaspberryPiController;

