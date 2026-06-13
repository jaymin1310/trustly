package com.trustly.servicerequest.dto.response.nested;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerDTO {
    private Long id;
    private String name;
}