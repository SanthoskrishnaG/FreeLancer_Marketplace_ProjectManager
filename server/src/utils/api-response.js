export class ApiResponse {
  static success(data = null, message = 'Operation successful', meta = null) {
    const response = {
      success: true,
      message,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  static error(message = 'An error occurred', code = 'ERROR', details = null) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
  }
}

export default ApiResponse;
