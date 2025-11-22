import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        ok: false,
        error: {
          code: 400,
          message: 'Validation error',
          details,
        },
      });
    }

    req.validatedBody = value;
    next();
  };
};

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const requestOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().length(6).required(),
  email: Joi.string().email().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const createProductSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  minStockLevel: Joi.number().default(10),
  maxStockLevel: Joi.number().default(1000),
  reorderPoint: Joi.number().default(50),
  unitPrice: Joi.number().default(0),
});

export const updateProductSchema = Joi.object({
  sku: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  minStockLevel: Joi.number().optional(),
  maxStockLevel: Joi.number().optional(),
  reorderPoint: Joi.number().optional(),
  unitPrice: Joi.number().optional(),
});

export const createMovementSchema = Joi.object({
  type: Joi.string().valid('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT').required(),
  fromLocationId: Joi.string().optional(),
  toLocationId: Joi.string().optional(),
  supplierId: Joi.string().optional(),
  productId: Joi.string().required(),
  notes: Joi.string().optional(),
  lines: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().required(),
      batchId: Joi.string().optional(),
    }),
  ),
});

export const createLocationSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string()
    .valid('WAREHOUSE', 'STORE', 'TRANSIT', 'DAMAGED', 'QUARANTINE')
    .required(),
  address: Joi.string().optional(),
  capacity: Joi.number().optional(),
});

export const createSupplierSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  zipCode: Joi.string().optional(),
});
