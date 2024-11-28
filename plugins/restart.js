const { bot } = require('../lib');
const { exec } = require('child_process');
const userLastRestart = new Map(); // To store last restart time for each user

bot(
  {
    pattern: 'restart',
    desc: 'Restarts the bot.',
    type: 'admin',
  },
  async (message) => {
    const userId = message.sender.id;
    const lastRestart = userLastRestart.get(userId) || 0;
    const cooldownPeriod = 60 * 1000; // 1 hour cooldown

    if (Date.now() - lastRestart < cooldownPeriod) {
      await message.send('You can only restart the bot once per hour.');
      return;
    }

    userLastRestart.set(userId, Date.now());

    // Notify the admin that the bot is restarting
    await message.send('Restarting the bot via PM2 (Bot Name: Whatsapp_MD)...');

    // Log the restart action for monitoring/debugging purposes
    console.log(`[INFO] Restart command received. Restarting bot: Whatsapp_MD, triggered by admin: ${message.sender}`);

    // Execute the PM2 restart command
    exec('pm2 restart Whatsapp_MD', (error, stdout, stderr) => {
      if (error) {
        console.error('[ERROR] Failed to restart bot via PM2:', error);
        message.send('*Failed to restart the bot. Please check the server logs.*');
        return;
      }

      if (stderr) {
        console.error('[ERROR] PM2 stderr output:', stderr);
        message.send('*Restart might have issues. Please check PM2 logs.*');
        return;
      }

      console.log('[INFO] PM2 restart output:', stdout);
      message.send('*Bot successfully restarted via PM2!*');
    });
  }
);
