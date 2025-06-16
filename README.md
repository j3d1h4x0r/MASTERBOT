# MASTERBOT

A Node.js application for controlling Raspberry Pi 5 settings and hardware through both CLI and web interface.

## 🤖 About

MASTERBOT is a comprehensive Raspberry Pi controller designed specifically for the Raspberry Pi 5. It provides full system control including GPIO management, service monitoring, WiFi configuration, system monitoring, and hardware control through both command-line interface and a beautiful web dashboard.

## ✨ Features

- **🌐 Web Dashboard**: Beautiful, responsive web interface for easy control
- **⚡ GPIO Control**: Complete GPIO pin management and control
- **🔧 Service Management**: Start, stop, restart, and monitor system services
- **📊 System Monitoring**: Real-time CPU temperature, memory, and disk usage
- **📶 WiFi Management**: Check status and scan for available networks
- **🔄 System Control**: Remote reboot and shutdown capabilities
- **🔐 Authentication**: Secure access with configurable authentication
- **📱 Mobile Friendly**: Responsive design works on all devices
- **🔌 REST API**: Full REST API for integration with other systems

## 🚀 Getting Started

### Prerequisites

- **Raspberry Pi 5** (or compatible Raspberry Pi)
- **Node.js 16+** installed
- **Git** for cloning the repository
- **sudo privileges** for system operations

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/j3d1h4x0r/MASTERBOT.git
   cd MASTERBOT
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the application:
   ```bash
   # Edit config.json with your preferred settings
   nano config.json
   ```

4. Start the application:
   ```bash
   # Start web server
   npm start
   
   # Or use CLI mode
   npm run cli
   ```

## 📖 Usage

### Web Interface

1. Start the web server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://your-pi-ip:3000
   ```

3. Login with default credentials:
   - **Username**: admin
   - **Password**: changeMe123!

   You can override these credentials using environment variables before starting the server:

   ```bash
   WEB_USER=myuser WEB_PASS=mypass npm start
   ```

### Command Line Interface

```bash
# Get system information
node index.js info

# Check CPU temperature
node index.js temp

# Control GPIO pin 18
node index.js gpio-set 18 dh
node index.js gpio-get 18

# Manage services
node index.js service-status ssh
node index.js service-control nginx restart

# WiFi operations
node index.js wifi-status
node index.js wifi-scan

# System control (use with caution!)
node index.js reboot
node index.js shutdown
```

### Configuration

Edit `config.json` to customize your setup:

```json
{
  "raspberry_pi": {
    "model": "Raspberry Pi 5",
    "gpio_pins": {
      "led_status": 18,
      "relay_1": 23,
      "relay_2": 24
    },
    "system": {
      "temperature_warning": 70,
      "temperature_critical": 80
    }
  },
  "web_interface": {
    "enabled": true,
    "port": 3000,
  "auth": {
      "enabled": true,
      "username": "admin",
      "password": "changeMe123!"
    }
  }
}
```

The `WEB_USER` and `WEB_PASS` environment variables can be set to override the `username` and `password` values when launching the server.

## 🏗️ Project Structure

```
MASTERBOT/
├── index.js             # CLI application & core controller
├── server.js            # Web server & REST API
├── config.json          # Configuration file
├── package.json         # Node.js dependencies
├── public/              # Web interface files
│   └── index.html      # Dashboard HTML
├── docs/               # Documentation
└── README.md           # This file
```

## 🔌 API Endpoints

### System Information
- `GET /api/system/info` - Get system information
- `GET /api/system/temperature` - Get CPU temperature
- `GET /api/system/memory` - Get memory usage
- `GET /api/system/disk` - Get disk usage

### GPIO Control
- `GET /api/gpio/:pin` - Get GPIO pin state
- `POST /api/gpio/:pin` - Set GPIO pin state

### Service Management
- `GET /api/service/:name/status` - Get service status
- `POST /api/service/:name/:action` - Control service

### WiFi Management
- `GET /api/wifi/status` - Get WiFi status
- `GET /api/wifi/scan` - Scan for networks

### System Control
- `POST /api/system/reboot` - Reboot system
- `POST /api/system/shutdown` - Shutdown system

## 🧪 Testing

Test the application:

```bash
# Test CLI commands
node index.js info

# Test web server
npm start
# Visit http://localhost:3000

# Test API endpoints
curl -u admin:changeMe123! http://localhost:3000/api/system/info
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who help improve MASTERBOT
- Inspired by the need for intelligent automation tools
- Built with ❤️ for the developer community

## 📞 Support

If you encounter any issues or have questions:

- Create an [Issue](https://github.com/j3d1h4x0r/MASTERBOT/issues)
- Check the [Documentation](docs/)
- Contact: [Your Email]

## 🔄 Version History

- **v1.0.0** - Initial release
  - Basic bot functionality
  - Plugin system
  - Configuration management

---

**MASTERBOT** - Automating the future, one task at a time. 🚀

