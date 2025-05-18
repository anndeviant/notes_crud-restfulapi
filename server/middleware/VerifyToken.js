import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", req.headers["authorization"]);
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res
      .status(401)
      .json({ message: "No authentication token provided" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);

      // Provide specific error message for token expiration
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({
          message: "Authentication token has expired",
          expiredAt: err.expiredAt,
          error: "token_expired",
        });
      }

      return res.status(403).json({
        message: "Invalid authentication token",
        error: err.name,
      });
    }

    // Store user data from token in the request object
    req.email = decoded.email;
    req.userId = decoded.id;
    req.name = decoded.name;

    next();
  });
};
