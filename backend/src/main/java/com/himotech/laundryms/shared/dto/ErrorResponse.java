package com.himotech.laundryms.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    /**
     * Optional list containing additional, structured information about the error.
     * <p>
     * This list is typically used to provide field-level or context-specific details,
     * such as validation errors, parameter names, or other metadata that helps
     * clients understand and handle the error.
     * <p>
     * When an {@link ErrorResponse} is created via {@link #of(String, String)}, this
     * field will be {@code null}. When additional information is available, it should
     * be supplied via {@link #of(String, String, List)}. Callers should therefore be
     * prepared to handle a {@code null} value for this field.
     */
    private List<String> details;

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, null);
    }

    public static ErrorResponse of(String code, String message, List<String> details) {
        return new ErrorResponse(code, message, details);
    }
}
