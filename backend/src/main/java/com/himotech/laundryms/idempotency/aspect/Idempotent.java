package com.himotech.laundryms.idempotency.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Indicates that a controller method should be executed with idempotency protection.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    /**
     * The business action type (e.g. "CREATE_ORDER", "UPDATE_CUSTOMER").
     * Defaults to the method name if empty.
     */
    String actionType() default "";
}
