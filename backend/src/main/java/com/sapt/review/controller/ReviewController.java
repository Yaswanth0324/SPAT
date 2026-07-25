package com.sapt.review.controller;

import com.sapt.common.response.ApiResponse;
import com.sapt.review.dto.ReviewDto;
import com.sapt.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewDto.Response>>> getAllReviews() {
        List<ReviewDto.Response> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto.Response>> createReview(
            @Valid @RequestBody ReviewDto.CreateRequest request
    ) {
        ReviewDto.Response created = reviewService.createReview(request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", created));
    }
}
