"use strict";
/* ============================================================================
 * Configuration
 * ========================================================================= */
require('dotenv').config();
const TOKEN = process.env.TOKEN;

/* ============================================================================
 * Read config file
 * ========================================================================= */
let config = JSON.parse(require('fs').readFileSync('config.json'));

/* ============================================================================
 * Create discord bot
 * ========================================================================= */
const { Client } = require('discord.js');
const bot = new Client();

/* ============================================================================
 * When bot is logged in, get channel named CHANNEL and start all cronjobs
 * ========================================================================= */
bot.on('ready', () => {

  // Loop through channel names
  bot.channels.cache.forEach(item => {

    // This is the correct channel!
    if (item.name == config.channel) {

      // Get channel object
      bot.channels.fetch(item.id)

        .then(channel => {

          // Greet IF we have a greeting defined
          if (config.greeting) {
            say(channel, config.greeting);
          }

          // Start crontabs
          crontabs();

        });

    }

  });

});

/* ============================================================================
 * Start crontabs
 * ========================================================================= */
const crontabs = () => {
  console.log("Running crontabs");

  // Create a new cronjob which prints message in the correct channel
  const { CronJob } = require('cron');

  // Loop through config.crontabs and start a cron job for each object
  config.crontabs.forEach(item => {
    const cron = new CronJob(item.crontab, () => {
      say(config.channel, item.message);
    }, null, true, config.timezone);
  });

}

/* ============================================================================
 * Helper function for local development. If config.live is false, print to 
 * console instead of spamming discord...
 * ========================================================================= */
const say = (channel, msg) => {
  if (config.live) {
    config.channel.send(msg);
  }
  console.log(`say: ${msg}`);
};

/* ============================================================================
 * Login bot OR run crontabs without bot
 * ========================================================================= */
if (config.live) {
  console.log("config.live=true : Discord bot will run.");
  bot.login(TOKEN);
} else {
  console.log("config.live=false : Discord bot will not run.");
  crontabs();
}

