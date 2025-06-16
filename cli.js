#!/usr/bin/env node
const { Command } = require('commander');
const RaspberryPiController = require('./index');
const pkg = require('./package.json');

const controller = new RaspberryPiController();
const program = new Command();

program
  .name('masterbot')
  .description('Raspberry Pi Controller CLI')
  .version(pkg.version);

program
  .command('info')
  .description('Get system information')
  .action(async () => {
    try {
      const info = await controller.getSystemInfo();
      console.log(JSON.stringify(info, null, 2));
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('temp')
  .description('Get CPU temperature')
  .action(async () => {
    try {
      const temp = await controller.getCPUTemperature();
      console.log(temp);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('memory')
  .description('Get memory usage')
  .action(async () => {
    try {
      const mem = await controller.getMemoryInfo();
      console.log(mem);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('disk')
  .description('Get disk usage')
  .action(async () => {
    try {
      const disk = await controller.getDiskUsage();
      console.log(disk);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('wifi-status')
  .description('Get WiFi status')
  .action(async () => {
    try {
      const status = await controller.getWiFiStatus();
      console.log(status);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('wifi-scan')
  .description('Scan for WiFi networks')
  .action(async () => {
    try {
      const networks = await controller.scanWiFi();
      networks.forEach(n => console.log(n));
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('gpio-set <pin> <state>')
  .description('Set GPIO pin state')
  .action(async (pin, state) => {
    try {
      const result = await controller.setGPIO(pin, state);
      console.log(result);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('gpio-get <pin>')
  .description('Get GPIO pin state')
  .action(async (pin) => {
    try {
      const state = await controller.getGPIO(pin);
      console.log(state);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('service-status <name>')
  .description('Get service status')
  .action(async (name) => {
    try {
      const status = await controller.getServiceStatus(name);
      console.log(status);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('service-control <name> <action>')
  .description('Control service')
  .action(async (name, action) => {
    try {
      const result = await controller.controlService(name, action);
      console.log(result);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('reboot')
  .description('Reboot system')
  .action(async () => {
    try {
      const msg = await controller.reboot();
      console.log(msg);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program
  .command('shutdown')
  .description('Shutdown system')
  .action(async () => {
    try {
      const msg = await controller.shutdown();
      console.log(msg);
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

program.parse();
