export class ApiResponse {
  static success(res, data = null, message = 'Operation successful', meta = null) {
    // Handle both signatures: (res, data, message, meta) and (data, message, meta)
    if (res && typeof res.status === 'function') {
      const response = {
        success: true,
        message,
        data,
      };
      if (meta) response.meta = meta;
      return res.status(200).json(response);
    }

    // Direct object return signature
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
        message,
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

  static error(res, message = 'An error occurred', statusCode = 400, details = null) {
    if (res && typeof res.status === 'function') {
      return res.status(statusCode).json({
        success: false,
        error: {
          code: `HTTP_${statusCode}`,
          message,
          details,
        },
      });
    }

    return {
      success: false,
      error: {
        code: 'ERROR',
        message: typeof res === 'string' ? res : message,
        details,
      },
    };
  }
}

export default ApiResponse;
