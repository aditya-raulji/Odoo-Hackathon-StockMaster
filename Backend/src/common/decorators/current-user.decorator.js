export const CurrentUser = (data) => {
  return (target, key, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (req, res, next) {
      const user = req.user;
      req.currentUser = data ? user?.[data] : user;
      return originalMethod.apply(this, arguments);
    };
    return descriptor;
  };
};
