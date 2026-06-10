package com.trustly.category.service.impl;

import com.trustly.category.dto.request.CreateCategoryRequest;
import com.trustly.category.dto.request.UpdateCategoryRequest;
import com.trustly.category.dto.response.CategoryResponse;
import com.trustly.category.entity.ServiceCategory;
import com.trustly.category.repository.ServiceCategoryRepository;
import com.trustly.category.service.CategoryManagementService;
import com.trustly.common.exception.DuplicateResourceException;
import com.trustly.common.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryManagementServiceImpl
        implements CategoryManagementService {

    private final ServiceCategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException(
                    "Category already exists with name: " + request.getName()
            );
        }

        ServiceCategory category = ServiceCategory.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .active(true)
                .build();

        ServiceCategory savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(
            Long categoryId,
            UpdateCategoryRequest request
    ) {

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId
                ));

        Optional<ServiceCategory> existingCategory =
                categoryRepository.findByNameIgnoreCase(request.getName().trim());

        if (existingCategory.isPresent()
                && !existingCategory.get().getId().equals(categoryId)) {

            throw new DuplicateResourceException(
                    "Category already exists with name: " + request.getName()
            );
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setActive(request.getActive());

        ServiceCategory updatedCategory = categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse getCategory(Long categoryId) {

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId
                ));

        return mapToResponse(category);
    }

    @Override
    @Transactional
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<CategoryResponse> getActiveCategories() {

        return categoryRepository.findAllByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CategoryResponse mapToResponse(ServiceCategory category) {

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}