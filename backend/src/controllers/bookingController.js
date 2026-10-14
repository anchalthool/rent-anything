const bookingService = require("../services/bookingService");

async function createBooking(req, res) {
  const listingId = req.body.listingId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  if (!listingId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Listing, start date and end date are required",
    });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      message: "End date must be after start date",
    });
  }

  try {
    const booking = await bookingService.createBooking(listingId, req.userId, startDate, endDate);
    res.status(201).json(booking);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function getReceivedBookings(req, res) {
  try {
    const result = await bookingService.findReceived(req.userId);

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function updateStatus(req, res) {
  const bookingId = Number(req.params.id);
  const status = req.body.status;

  if (status !== "approved" && status !== "rejected") {
    return res.status(400).json({
      message: "Status must be approved or rejected",
    });
  }

  try {
    const result = await bookingService.updateStatus(status, bookingId, req.userId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function cancelBooking(req, res) {
  const bookingId = Number(req.params.id);

  try {
    const result = await bookingService.cancel(bookingId, req.userId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking cannot be cancelled",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function completeBooking(req, res) {
  const bookingId = Number(req.params.id);

  try {
    const result = await bookingService.complete(bookingId, req.userId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking cannot be completed"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

async function getCheckout(req, res) {
  const bookingId = Number(req.params.id);

  try {
    const booking = await bookingService.getCheckout(bookingId, req.userId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or not ready for checkout"
      });
    }

    res.json(booking);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

async function payBooking(req, res) {
  const bookingId = Number(req.params.id);

  try {
    const result = await bookingService.pay(bookingId, req.userId);

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Booking cannot be paid"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

async function getMyBookings(req, res) {
  try {
    const result = await bookingService.findByRenterId(req.userId);

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

module.exports = { createBooking, getReceivedBookings, updateStatus, cancelBooking, completeBooking, getCheckout, payBooking, getMyBookings };
