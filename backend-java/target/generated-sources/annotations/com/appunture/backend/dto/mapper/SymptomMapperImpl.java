package com.appunture.backend.dto.mapper;

import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.entity.Symptom;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-08T17:14:13-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.40.0.z20241112-1021, environment: Java 17.0.13 (Eclipse Adoptium)"
)
@Component
public class SymptomMapperImpl implements SymptomMapper {

    @Override
    public Symptom toEntity(SymptomRequest request) {
        if ( request == null ) {
            return null;
        }

        Symptom.SymptomBuilder symptom = Symptom.builder();

        symptom.category( request.getCategory() );
        symptom.description( request.getDescription() );
        symptom.name( request.getName() );

        return symptom.build();
    }

    @Override
    public void updateEntity(SymptomRequest request, Symptom entity) {
        if ( request == null ) {
            return;
        }

        if ( request.getCategory() != null ) {
            entity.setCategory( request.getCategory() );
        }
        if ( request.getDescription() != null ) {
            entity.setDescription( request.getDescription() );
        }
        if ( request.getName() != null ) {
            entity.setName( request.getName() );
        }
    }

    @Override
    public SymptomResponse toResponse(Symptom entity) {
        if ( entity == null ) {
            return null;
        }

        SymptomResponse.SymptomResponseBuilder symptomResponse = SymptomResponse.builder();

        symptomResponse.category( entity.getCategory() );
        symptomResponse.description( entity.getDescription() );
        symptomResponse.id( entity.getId() );
        symptomResponse.name( entity.getName() );

        return symptomResponse.build();
    }
}
