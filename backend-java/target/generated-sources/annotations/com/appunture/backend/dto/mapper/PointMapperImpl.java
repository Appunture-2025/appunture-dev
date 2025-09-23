package com.appunture.backend.dto.mapper;

import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.entity.Point;
import jakarta.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-09-03T14:47:47+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 11.0.14.1 (Microsoft)"
)
@Component
public class PointMapperImpl implements PointMapper {

    @Override
    public Point toEntity(PointRequest request) {
        if ( request == null ) {
            return null;
        }

        Point.PointBuilder point = Point.builder();

        point.code( request.getCode() );
        point.name( request.getName() );
        point.chineseName( request.getChineseName() );
        point.meridian( request.getMeridian() );
        point.location( request.getLocation() );
        point.indications( request.getIndications() );
        point.contraindications( request.getContraindications() );
        point.coordinatesJson( request.getCoordinatesJson() );
        point.imageUrl( request.getImageUrl() );

        return point.build();
    }

    @Override
    public void updateEntity(PointRequest request, Point entity) {
        if ( request == null ) {
            return;
        }

        if ( request.getCode() != null ) {
            entity.setCode( request.getCode() );
        }
        if ( request.getName() != null ) {
            entity.setName( request.getName() );
        }
        if ( request.getChineseName() != null ) {
            entity.setChineseName( request.getChineseName() );
        }
        if ( request.getMeridian() != null ) {
            entity.setMeridian( request.getMeridian() );
        }
        if ( request.getLocation() != null ) {
            entity.setLocation( request.getLocation() );
        }
        if ( request.getIndications() != null ) {
            entity.setIndications( request.getIndications() );
        }
        if ( request.getContraindications() != null ) {
            entity.setContraindications( request.getContraindications() );
        }
        if ( request.getCoordinatesJson() != null ) {
            entity.setCoordinatesJson( request.getCoordinatesJson() );
        }
        if ( request.getImageUrl() != null ) {
            entity.setImageUrl( request.getImageUrl() );
        }
    }

    @Override
    public PointResponse toResponse(Point point) {
        if ( point == null ) {
            return null;
        }

        PointResponse.PointResponseBuilder pointResponse = PointResponse.builder();

        pointResponse.id( point.getId() );
        pointResponse.code( point.getCode() );
        pointResponse.name( point.getName() );
        pointResponse.chineseName( point.getChineseName() );
        pointResponse.meridian( point.getMeridian() );
        pointResponse.location( point.getLocation() );
        pointResponse.indications( point.getIndications() );
        pointResponse.contraindications( point.getContraindications() );
        pointResponse.coordinatesJson( point.getCoordinatesJson() );
        pointResponse.imageUrl( point.getImageUrl() );

        return pointResponse.build();
    }
}
