const userService = require("../services/userService");

async function getMe(req, res) {
  try {
    const result = await userService.findById(req.userId);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

async function updateMe(req, res) {
  const name = req.body.name;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "Name is required"
    });
  }

  try {
    const result = await userService.updateName(name.trim(), req.userId);

    res.json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
}

module.exports = { getMe, updateMe };
