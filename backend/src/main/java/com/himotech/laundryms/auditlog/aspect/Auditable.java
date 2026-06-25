package com.himotech.laundryms.auditlog.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods for custom audit logging.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    /**
     * The type of action being performed (e.g., LOGIN, ORDER_CREATE).
     */
    String action();

    /**
     * A human-readable description of the action.
     */
    String description() default "";
}
