package com.trustly.category.controller;

import com.trustly.category.dto.request.CreateCategoryRequest;
import com.trustly.category.dto.request.UpdateCategoryRequest;
import com.trustly.category.dto.response.CategoryResponse;
import com.trustly.category.service.CategoryManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryManagementService categoryManagementService;

    @PostMapping
    public CategoryResponse createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return categoryManagementService.createCategory(request);
    }

    @PatchMapping("/{categoryId}")
    public CategoryResponse updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        return categoryManagementService.updateCategory(
                categoryId,
                request
        );
    }

    @GetMapping("/{categoryId}")
    public CategoryResponse getCategory(
            @PathVariable Long categoryId
    ) {
        return categoryManagementService.getCategory(categoryId);
    }

    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryManagementService.getAllCategories();
    }
}