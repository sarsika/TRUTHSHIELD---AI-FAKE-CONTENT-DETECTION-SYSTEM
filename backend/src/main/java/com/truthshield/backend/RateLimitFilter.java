package com.truthshield.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory fixed-window rate limiter — max N requests per IP per
 * window on /api/**. Good enough for a solo/single-instance deployment.
 *
 * For a multi-instance production deployment, replace with a shared store
 * (Redis) or a proper library such as bucket4j, since this in-memory map
 * won't be consistent across multiple backend instances.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_WINDOW = 30;
    private static final long WINDOW_MS = 60_000; // 1 minute

    private final ConcurrentHashMap<String, Window> requestCounts = new ConcurrentHashMap<>();

    private static class Window {
        volatile long windowStart;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long windowStart) { this.windowStart = windowStart; }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = request.getRemoteAddr();
        long now = System.currentTimeMillis();
        Window window = requestCounts.computeIfAbsent(clientIp, k -> new Window(now));

        synchronized (window) {
            if (now - window.windowStart > WINDOW_MS) {
                window.windowStart = now;
                window.count.set(0);
            }
            if (window.count.incrementAndGet() > MAX_REQUESTS_PER_WINDOW) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":\"error\",\"message\":\"Too many requests — please slow down and try again in a minute.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
