export const ROLES_KEY = 'roles';

export const Roles = (...roles) => {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
    return descriptor;
  };
};
