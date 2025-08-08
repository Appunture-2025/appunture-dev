package com.appunture.backend.dto.stats;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MeridianStatResponse {
    String meridian;
    long count;
}
