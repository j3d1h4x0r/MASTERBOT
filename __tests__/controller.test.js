const RaspberryPiController = require('../index');
const { exec } = require('child_process');

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('RaspberryPiController core methods', () => {
  let controller;
  beforeEach(() => {
    controller = new RaspberryPiController();
    jest.clearAllMocks();
  });

  describe('getSystemInfo', () => {
    test('returns info without temperature when not Raspberry Pi', async () => {
      controller.isRaspberryPi = false;
      const info = await controller.getSystemInfo();
      expect(info).toHaveProperty('platform');
      expect(info).not.toHaveProperty('temperature');
    });

    test('includes temperature when Raspberry Pi', async () => {
      controller.isRaspberryPi = true;
      exec.mockImplementation((cmd, cb) => cb(null, "temp=55.0'C\n"));
      const info = await controller.getSystemInfo();
      expect(exec).toHaveBeenCalledWith('vcgencmd measure_temp', expect.any(Function));
      expect(info).toHaveProperty('temperature', "temp=55.0'C");
    });
  });

  describe('getCPUTemperature', () => {
    test('returns CPU temperature value', async () => {
      controller.isRaspberryPi = true;
      exec.mockImplementation((cmd, cb) => cb(null, "temp=55.0'C\n"));
      const temp = await controller.getCPUTemperature();
      expect(exec).toHaveBeenCalled();
      expect(temp).toBe("55.0'C");
    });

    test('throws when not Raspberry Pi', async () => {
      controller.isRaspberryPi = false;
      await expect(controller.getCPUTemperature()).rejects.toThrow('CPU temperature only available on Raspberry Pi');
    });
  });
});
