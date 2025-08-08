package com.appunture.backend.dto.mapper;

import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.entity.Symptom;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SymptomMapper {

    Symptom toEntity(SymptomRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(SymptomRequest request, @MappingTarget Symptom entity);

    SymptomResponse toResponse(Symptom entity);
}
