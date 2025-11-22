export const ApiResponseExample = {
  success: {
    ok: true,
    data: {},
    meta: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    },
  },
  error: {
    ok: false,
    error: {
      code: 400,
      message: 'Error message',
      details: {},
    },
  },
};

export const createSuccessResponse = (data, meta = null) => {
  const response = {
    ok: true,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return response;
};

export const createErrorResponse = (code, message, details = null) => {
  const response = {
    ok: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    response.error.details = details;
  }
  return response;
};

export const createPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
