package com.sapt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * ============================================================
 * AsyncConfig - Enable Asynchronous Method Execution
 * ============================================================
 * Enables @Async support for background tasks such as:
 *  - Sending emails (NotificationService)
 *  - Sending OTPs (OtpMailService)
 *
 * Without this class, @Async annotations have NO effect.
 *
 * TODO (Backend Team):
 *  - Optionally configure a custom ThreadPoolTaskExecutor
 *    to control the async thread pool size
 * ============================================================
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    // @Async is enabled globally.
    // Default executor: SimpleAsyncTaskExecutor (creates a new thread per call).
    //
    // TODO: For production, define a bounded thread pool:
    //
    // @Bean(name = "emailTaskExecutor")
    // public Executor emailTaskExecutor() {
    //     ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    //     executor.setCorePoolSize(2);
    //     executor.setMaxPoolSize(5);
    //     executor.setQueueCapacity(100);
    //     executor.setThreadNamePrefix("email-");
    //     executor.initialize();
    //     return executor;
    // }
}
