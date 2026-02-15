package com.himotech.laundryms.api.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.Map;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    /**
     * Optional map containing additional, structured information about the error.
     * <p>
     * This map is typically used to provide field-level or context-specific details,
     * such as validation errors, parameter names, or other metadata that helps
     * clients understand and handle the error.
     * <p>
     * When an {@link ErrorResponse} is created via {@link #of(String, String)}, this
     * field will be {@code null}. When additional information is available, it should
     * be supplied via {@link #of(String, String, Map)}. Callers should therefore be
     * prepared to handle a {@code null} value for this field.
     */
    private Map<String, Object> details;
    private OffsetDateTime timestamp;

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, null, OffsetDateTime.now());
    }

    public static ErrorResponse of(String code, String message, Map<String, Object> details) {
        return new ErrorResponse(code, message, details, OffsetDateTime.now());
    }
}
