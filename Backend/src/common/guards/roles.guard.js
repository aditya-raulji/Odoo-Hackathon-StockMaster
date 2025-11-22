export const rolesGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: {
          code: 401,
          message: 'Unauthorized',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 403,
          message: 'Forbidden - Insufficient permissions',
        },
      });
    }

    next();
  };
};
