const { Queue } = require("bullmq");

const paymentQueue = new Queue("payments", {
  connection: {
    host: "127.0.0.1",
    port: 6379
  }
});

module.exports = paymentQueue;

