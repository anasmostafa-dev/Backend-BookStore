const jwt = require("jsonwebtoken");

const auth = (requiredRole = null) => {
  return (req, res, next) => {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.split(" ")[1] ||
      req.header("x-auth-token");

    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Access Denied" });
      }

      console.log(decoded);

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
  };
};
const cookieAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No Token Provided.." });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
module.exports = {auth, cookieAuth};
