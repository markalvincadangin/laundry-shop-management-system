package com.himotech.laundryms.api.error;

import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@AllArgsConstructor
public class ApiError {
    private String code;
    private String message;
    private Map<String, Object> details;
    private OffsetDateTime timestamp;

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, null, OffsetDateTime.now());
    }

    public static ApiError of(String code, String message, Map<String, Object> details) {
        return new ApiError(code, message, details, OffsetDateTime.now());
    }
}
