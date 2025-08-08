package com.appunture.backend.dto.mapper;

import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.dto.point.PointResponse;
import com.appunture.backend.entity.Point;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-08T17:14:13-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.40.0.z20241112-1021, environment: Java 17.0.13 (Eclipse Adoptium)"
)
@Component
public class PointMapperImpl implements PointMapper {

    @Override
    public Point toEntity(PointRequest request) {
        if ( request == null ) {
            return null;
        }

        Point.PointBuilder point = Point.builder();

        point.chineseName( request.getChineseName() );
        point.code( request.getCode() );
        point.contraindications( request.getContraindications() );
        point.coordinatesJson( request.getCoordinatesJson() );
        point.imageUrl( request.getImageUrl() );
        point.indications( request.getIndications() );
        point.location( request.getLocation() );
        point.meridian( request.getMeridian() );
        point.name( request.getName() );

        return point.build();
    }

    @Override
    public void updateEntity(PointRequest request, Point entity) {
        if ( request == null ) {
            return;
        }

        if ( request.getChineseName() != null ) {
            entity.setChineseName( request.getChineseName() );
        }
        if ( request.getCode() != null ) {
            entity.setCode( request.getCode() );
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
        if ( request.getIndications() != null ) {
            entity.setIndications( request.getIndications() );
        }
        if ( request.getLocation() != null ) {
            entity.setLocation( request.getLocation() );
        }
        if ( request.getMeridian() != null ) {
            entity.setMeridian( request.getMeridian() );
        }
        if ( request.getName() != null ) {
            entity.setName( request.getName() );
        }
    }

    @Override
    public PointResponse toResponse(Point point) {
        if ( point == null ) {
            return null;
        }

        PointResponse.PointResponseBuilder pointResponse = PointResponse.builder();

        pointResponse.chineseName( point.getChineseName() );
        pointResponse.code( point.getCode() );
        pointResponse.contraindications( point.getContraindications() );
        pointResponse.coordinatesJson( point.getCoordinatesJson() );
        pointResponse.id( point.getId() );
        pointResponse.imageUrl( point.getImageUrl() );
        pointResponse.indications( point.getIndications() );
        pointResponse.location( point.getLocation() );
        pointResponse.meridian( point.getMeridian() );
        pointResponse.name( point.getName() );

        return pointResponse.build();
    }
}
