package com.himotech.laundryms.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.io.IOException;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.Filter;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;

class ApiCacheControlFilterTest {

    @Test
    void apiFilterHasExplicitOrder() {
        Class<?> filterType = assertDoesNotThrow(
                () -> Class.forName("com.himotech.laundryms.config.ApiCacheControlFilter"));

        Order order = filterType.getAnnotation(Order.class);
        assertThat(order).isNotNull();
        assertThat(order.value()).isEqualTo(Ordered.HIGHEST_PRECEDENCE + 2);
    }

    @Test
    void apiResponsesAreNonCacheableForPublicAuthenticatedMutationAndErrorPaths()
            throws ServletException, IOException {
        Filter filter = new ApiCacheControlFilter();
        List<MockHttpServletRequest> requests = List.of(
                request("GET", "/api/v1/health"),
                request("POST", "/api/v1/auth/login"),
                request("POST", "/api/v1/auth/refresh"),
                request("GET", "/api/v1/orders"),
                request("POST", "/api/v1/orders"),
                request("GET", "/api/v1/failing"));

        for (MockHttpServletRequest request : requests) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, (filterRequest, filterResponse) -> {
                if (request.getRequestURI().endsWith("/failing")) {
                    ((HttpServletResponse) filterResponse).setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            });

            assertThat(response.getHeader("Cache-Control")).isEqualTo("no-store, no-cache, must-revalidate");
            assertThat(response.getHeader("Pragma")).isEqualTo("no-cache");
        }
    }

    @Test
    void nonApiResponsesAreNotModified() throws ServletException, IOException {
        Filter filter = new ApiCacheControlFilter();
        MockHttpServletRequest request = request("GET", "/health");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (filterRequest, filterResponse) -> {
            // A non-API endpoint must retain its own cache behavior.
        });

        assertThat(response.getHeader("Cache-Control")).isNull();
        assertThat(response.getHeader("Pragma")).isNull();
    }

    private MockHttpServletRequest request(String method, String uri) {
        return new MockHttpServletRequest(method, uri);
    }
}
