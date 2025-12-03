export const isAdmin = (req, res, next) => {
  if (
    (req.user && req.user.role === "admin") ||
    (req.user && process.env.ADMIN_EMAIL && req.user.email === process.env.ADMIN_EMAIL)
  ) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
