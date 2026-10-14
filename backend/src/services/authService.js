const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");

async function createUser(name, email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  return authRepository.createUser(name.trim(), email.trim().toLowerCase(), passwordHash);
}

async function login(email, password) {
  const result = await authRepository.findUserByEmail(email.trim().toLowerCase());
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return null;
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return {
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

module.exports = { createUser, login };
