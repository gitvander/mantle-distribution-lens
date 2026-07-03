/* Starts the local research server and opens the dashboard in the default browser. */
const { exec } = require("child_process");

require("./server.js");

setTimeout(() => {
  exec('start "" "http://127.0.0.1:4201"');
  console.log("Keep this window open while you use the live analysis.");
}, 650);
