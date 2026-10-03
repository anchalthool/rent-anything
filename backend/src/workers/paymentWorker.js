const { Worker } = require("bullmq");
const pool = require("../db/db");

const worker = new Worker(
  "payments",
  async (job) => {
    console.log("Processing payment:", job.data);

    await pool.query(
      `UPDATE payments
       SET status = 'paid'
       WHERE id = $1`,
      [job.data.paymentId]
    );
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379
    }
  }
);