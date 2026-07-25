package com.sapt.review.service;

import com.sapt.review.dto.ReviewDto;
import java.util.List;

public interface ReviewService {
    List<ReviewDto.Response> getAllReviews();
    ReviewDto.Response createReview(ReviewDto.CreateRequest request);
}
