package com.trustly.workerprofile.service.impl;

import com.trustly.common.exception.BadRequestException;
import com.trustly.complaint.entity.WorkerPenalty;
import com.trustly.complaint.enums.PenaltyAction;
import com.trustly.complaint.enums.PenaltyStatus;
import com.trustly.workerprofile.dto.response.WorkerSearchResponse;
import com.trustly.workerprofile.entity.WorkerProfile;
import com.trustly.workerprofile.repository.WorkerProfileRepository;
import com.trustly.workerprofile.service.WorkerSearchService;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkerSearchServiceImpl
        implements WorkerSearchService {

    private static final int MAX_PAGE_SIZE = 50;

    private final WorkerProfileRepository workerProfileRepository;

    @Override
    public Page<WorkerSearchResponse> searchWorkers(
            Long category,
            String city,
            String state,
            BigDecimal minimumRating,
            String sort,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        validatePage(page),
                        validateSize(size),
                        resolveSort(sort)
                );

        return workerProfileRepository
                .findAll(
                        buildSpecification(
                                category,
                                city,
                                state,
                                minimumRating
                        ),
                        pageable
                )
                .map(this::mapToResponse);
    }

    private Specification<WorkerProfile> buildSpecification(
            Long category,
            String city,
            String state,
            BigDecimal minimumRating
    ) {

        return (root, query, criteriaBuilder) -> {

            if (query.getResultType() != Long.class) {
                root.fetch(
                        "worker",
                        JoinType.LEFT
                );
                root.fetch(
                        "category",
                        JoinType.LEFT
                );
                query.distinct(true);
            }

            List<Predicate> predicates =
                    new ArrayList<>();

            var penaltySubQuery =
                    query.subquery(Long.class);

            var penaltyRoot =
                    penaltySubQuery.from(
                            WorkerPenalty.class
                    );

            penaltySubQuery.select(
                    penaltyRoot.get("id")
            );

            penaltySubQuery.where(
                    criteriaBuilder.equal(
                            penaltyRoot.get("workerProfile")
                                    .get("id"),
                            root.get("id")
                    ),

                    criteriaBuilder.equal(
                            penaltyRoot.get("status"),
                            PenaltyStatus.ACTIVE
                    ),

                    penaltyRoot.get("action").in(
                            PenaltyAction.TEMP_SUSPENSION,
                            PenaltyAction.PERMANENT_BAN
                    )
            );

            predicates.add(
                    criteriaBuilder.not(
                            criteriaBuilder.exists(
                                    penaltySubQuery
                            )
                    )
            );

            predicates.add(
                    criteriaBuilder.isTrue(
                            root.get("profileCompleted")
                    )
            );

            if (category != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category").get("id"),
                                category
                        )
                );
            }

            if (city != null && !city.isBlank()) {
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("city")
                                ),
                                "%" + city.trim().toLowerCase() + "%"
                        )
                );
            }

            if (state != null && !state.isBlank()) {
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("state")
                                ),
                                "%" + state.trim().toLowerCase() + "%"
                        )
                );
            }

            if (minimumRating != null) {
                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("averageRating"),
                                minimumRating
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(
                            new Predicate[0]
                    )
            );
        };
    }

    private Sort resolveSort(
            String sort
    ) {

        if (sort == null || sort.isBlank()) {
            return Sort.by(
                    Sort.Direction.DESC,
                    "averageRating"
            );
        }

        return switch (sort.trim().toLowerCase()) {
            case "rating" ->
                    Sort.by(
                            Sort.Direction.DESC,
                            "averageRating"
                    );
            case "totalreviews", "total_reviews" ->
                    Sort.by(
                            Sort.Direction.DESC,
                            "totalReviews"
                    );
            case "newest" ->
                    Sort.by(
                            Sort.Direction.DESC,
                            "createdAt"
                    );
            default ->
                    throw new BadRequestException(
                            "Invalid worker search sort"
                    );
        };
    }

    private int validatePage(
            int page
    ) {

        if (page < 0) {
            throw new BadRequestException(
                    "Page must not be negative"
            );
        }

        return page;
    }

    private int validateSize(
            int size
    ) {

        if (size <= 0 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException(
                    "Size must be between 1 and 50"
            );
        }

        return size;
    }

    private WorkerSearchResponse mapToResponse(
            WorkerProfile profile
    ) {

        return WorkerSearchResponse.builder()
                .id(
                        profile.getId()
                )
                .workerId(
                        profile.getWorker().getId()
                )
                .workerName(
                        profile.getWorker().getName()
                )
                .categoryId(
                        profile.getCategory() == null
                                ? null
                                : profile.getCategory().getId()
                )
                .categoryName(
                        profile.getCategory() == null
                                ? null
                                : profile.getCategory().getName()
                )
                .bio(
                        profile.getBio()
                )
                .experienceYears(
                        profile.getExperienceYears()
                )
                .city(
                        profile.getCity()
                )
                .state(
                        profile.getState()
                )
                .averageRating(
                        profile.getAverageRating()
                )
                .totalReviews(
                        profile.getTotalReviews()
                )
                .build();
    }
}