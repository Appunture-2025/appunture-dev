package com.appunture.backend.dto.mapper;

import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.entity.Point;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PointMapper {

    Point toEntity(PointRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(PointRequest request, @MappingTarget Point entity);

    PointResponse toResponse(Point point);
}
