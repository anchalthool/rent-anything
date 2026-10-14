const authService = require("../services/authService");

async function register(req, res) {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // Check name
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "Name is required"
    });
  }

  // Check email
  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  // Check password
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  try {

    const result = await authService.createUser(name, email, password);

    const newUser = result.rows[0];

    res.status(201).json(newUser);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

}

async function login(req, res) {

  const email = req.body.email;
  const password = req.body.password;

  if (
    typeof email !== "string" ||
    email.trim() === ""
  ) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  if (
    typeof password !== "string" ||
    password === ""
  ) {
    return res.status(400).json({
      message: "Password is required"
    });
  }

  try {

    const result = await authService.login(email, password);
    if (!result) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

}

module.exports = { register, login };
