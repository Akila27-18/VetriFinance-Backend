// middleware/auth.js
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded will have { id, email } from login/signup
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
