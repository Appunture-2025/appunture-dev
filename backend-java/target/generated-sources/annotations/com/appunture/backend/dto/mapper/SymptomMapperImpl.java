package com.appunture.backend.dto.mapper;

import com.appunture.backend.dto.symptom.SymptomRequest;
import com.appunture.backend.dto.symptom.SymptomResponse;
import com.appunture.backend.entity.Symptom;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-09-03T14:47:48+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 11.0.14.1 (Microsoft)"
)
@Component
public class SymptomMapperImpl implements SymptomMapper {

    @Override
    public Symptom toEntity(SymptomRequest request) {
        if ( request == null ) {
            return null;
        }

        Symptom.SymptomBuilder symptom = Symptom.builder();

        symptom.name( request.getName() );
        symptom.category( request.getCategory() );
        symptom.description( request.getDescription() );

        return symptom.build();
    }

    @Override
    public void updateEntity(SymptomRequest request, Symptom entity) {
        if ( request == null ) {
            return;
        }

        if ( request.getName() != null ) {
            entity.setName( request.getName() );
        }
        if ( request.getCategory() != null ) {
            entity.setCategory( request.getCategory() );
        }
        if ( request.getDescription() != null ) {
            entity.setDescription( request.getDescription() );
        }
    }

    @Override
    public SymptomResponse toResponse(Symptom entity) {
        if ( entity == null ) {
            return null;
        }

        SymptomResponse.SymptomResponseBuilder symptomResponse = SymptomResponse.builder();

        symptomResponse.id( entity.getId() );
        symptomResponse.name( entity.getName() );
        symptomResponse.category( entity.getCategory() );
        symptomResponse.description( entity.getDescription() );

        return symptomResponse.build();
    }
}
