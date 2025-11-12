class ApiError extends Error {
    constructor(statusCode, code, message, details = {}) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = code;
        this.details = details;
    }

    static badRequest(message, details) {
        // 400
        return new ApiError(400, "VALIDATION_ERROR", message || "Invalid input data", details);
    }

    static unauthorized(message) {
        // 401
        return new ApiError(401, "UNAUTHORIZED", message || "Access token is missing or invalid");
    }
    
    static forbidden(message) {
        // 403
        return new ApiError(403, "FORBIDDEN", message || "You do not have permission to access this resource");
    }
    
    static notFound(message) {
        // 404
        return new ApiError(404, "NOT_FOUND", message || "Resource not found");
    }
    
    // (เพิ่ม static method สำหรับ 409, 429 ถ้าต้องการ)
}

module.exports = ApiError;