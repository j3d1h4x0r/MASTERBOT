#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class RaspberryPiController {
    constructor() {
        this.isRaspberryPi = this.detectRaspberryPi();
        console.log(`🤖 MASTERBOT initialized on ${this.isRaspberryPi ? 'Raspberry Pi' : 'other system'}`);
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
            exec('iwconfig wlan0', (error, stdout, stderr) => {
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
            exec('sudo iwlist wlan0 scan | grep ESSID', (error, stdout, stderr) => {
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

module.exports = RaspberryPiController;

