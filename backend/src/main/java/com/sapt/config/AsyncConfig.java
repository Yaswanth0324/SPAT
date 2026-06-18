package com.sapt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.context.annotation.Bean;

import java.util.concurrent.Executor;

/**
 * ============================================================
 * AsyncConfig - Enable Asynchronous and Scheduled Execution
 * ============================================================
 * Enables:
 *  - @Async  — for background email/notification tasks
 *  - @Scheduled — for periodic cleanup jobs (e.g., OTP expiry)
 *
 * Async thread pool:
 *  - Core threads:  2 (always alive, handle steady email traffic)
 *  - Max threads:   5 (spins up during bursts)
 *  - Queue capacity: 100 (pending tasks buffer)
 *  - Thread prefix: "email-" (visible in logs and profilers)
 * ============================================================
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    /**
     * Custom thread pool for async email/notification tasks.
     * Named "emailTaskExecutor" to scope it specifically to email work.
     * Other @Async tasks will use the default executor unless specified.
     */
    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        return executor;
    }
}
