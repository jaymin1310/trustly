package com.trustly.category.service;

import com.trustly.category.dto.request.CreateCategoryRequest;
import com.trustly.category.dto.request.UpdateCategoryRequest;
import com.trustly.category.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryManagementService {

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(
            Long categoryId,
            UpdateCategoryRequest request
    );

    CategoryResponse getCategory(Long categoryId);

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getActiveCategories();
}