export class ApiResponse {
  static success(res, data = null, message = 'Operation successful', meta = null) {
    // Handle both Express res signature: (res, data, message, meta) and direct return: (data, message, meta)
    if (res && typeof res.status === 'function') {
      const response = {
        success: true,
        message: typeof message === 'string' ? message : 'Operation successful',
        data,
      };
      if (meta) response.meta = meta;
      return res.status(200).json(response);
    }

    const response = {
      success: true,
      message: typeof data === 'string' ? data : 'Operation successful',
      data: res,
    };
    if (message && typeof message === 'object') response.meta = message;
    return response;
  }

  static created(res, data = null, message = 'Resource created successfully', meta = null) {
    if (res && typeof res.status === 'function') {
      const response = {
        success: true,
        message: typeof message === 'string' ? message : 'Resource created successfully',
        data,
      };
      if (meta) response.meta = meta;
      return res.status(201).json(response);
    }

    return {
      success: true,
      message: typeof data === 'string' ? data : 'Resource created successfully',
      data: res,
    };
  }

  static error(res, arg2 = 400, arg3 = 'An error occurred', arg4 = 'ERROR', arg5 = {}) {
    if (res && typeof res.status === 'function') {
      let statusCode = 400;
      let message = 'An error occurred';
      let code = 'ERROR';
      let fields = {};

      if (typeof arg2 === 'number') {
        // Signature: (res, statusCode, message, code, fields)
        statusCode = arg2;
        message = typeof arg3 === 'string' ? arg3 : 'An error occurred';
        code = typeof arg4 === 'string' ? arg4 : `HTTP_${statusCode}`;
        fields = typeof arg5 === 'object' ? arg5 : {};
      } else if (typeof arg2 === 'string') {
        // Signature: (res, message, statusCode, details)
        message = arg2;
        statusCode = typeof arg3 === 'number' ? arg3 : 400;
        code = `HTTP_${statusCode}`;
        fields = typeof arg4 === 'object' ? arg4 : {};
      }

      return res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
        },
      });
    }

    return {
      success: false,
      error: {
        code: typeof arg3 === 'string' ? arg3 : 'ERROR',
        message: typeof res === 'string' ? res : 'An error occurred',
        fields: typeof arg4 === 'object' ? arg4 : {},
      },
    };
  }
}

export default ApiResponse;
