const paymentService = require("../services/paymentService");

async function createPayment(req, res) {
  try {
    const result = await paymentService.createPayment(req.params.bookingId, req.userId);
    return res.status(result.created ? 202 : 200).json(result.payment);

  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);

    // Duplicate payment / idempotency protection
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Payment already exists",
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

module.exports = { createPayment };
