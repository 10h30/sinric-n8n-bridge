const axios = require('axios');
const { SinricPro, SinricProSwitch } = require('sinricpro');

const APP_KEY = process.env.APP_KEY;
const APP_SECRET = process.env.APP_SECRET;
const DEVICE_ID = process.env.DEVICE_ID;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_TOKEN = process.env.N8N_TOKEN;

async function callN8n(action) {
  try {
    const res = await axios.post(
      N8N_WEBHOOK_URL,
      { action },
      { headers: { 'X-Token': N8N_TOKEN, 'Content-Type': 'application/json' } },
    );
    console.log(`[n8n] ${action} -> ${res.status}`);
  } catch (err) {
    console.error('[n8n error]', err.message);
  }
}

const device = new SinricProSwitch(DEVICE_ID);

// Use onPowerState, not device.on("setPowerState")
device.onPowerState(async (deviceId, state) => {
  const action = state ? 'on' : 'off';
  console.log(`[sinric] ${action.toUpperCase()}`);
  await callN8n(action);
  return true; // must return true to confirm to Sinric
});

const sinric = new SinricPro();
sinric.add(device);

sinric.onConnected(() => console.log('[bridge] Connected'));
sinric.onDisconnected(() => console.log('[bridge] Disconnected'));

sinric.begin({
  appKey: APP_KEY,
  appSecret: APP_SECRET,
  server: 'ws.sinric.pro',
  port: 443,
});
