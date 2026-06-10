package com.trustly.category.controller;

import com.trustly.category.dto.response.CategoryResponse;
import com.trustly.category.service.CategoryManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryManagementService categoryManagementService;

    @GetMapping("/api/categories")
    public List<CategoryResponse> getActiveCategories() {
        return categoryManagementService.getActiveCategories();
    }
}