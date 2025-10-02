import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useMap, AdvancedMarker, Pin} from '@vis.gl/react-google-maps';
import {MarkerClusterer} from '@googlemaps/markerclusterer';
import { Circle } from './circle';

export function PoiMarkers( { pois } ) {
    const map = useMap();
    const [markers, setMarkers] = useState({});
    const clusterer = useRef(null);
    const [circleCenter, setCircleCenter] = useState(null);

    // handleClick is a higher-order function so we can capture the POI key
    const handleClick = useCallback(
        (key) => (ev) => {
            if (!map) return;
            if (ev && ev.latLng) {
                map.panTo(ev.latLng);
                setCircleCenter(ev.latLng);
            }
            console.log('event clicked:', key);
        },
        [map]
    );

    useEffect(() => {
        if (!map) return;
        if (!clusterer.current) {
            clusterer.current = new MarkerClusterer({map});
        }
    }, [map]);

    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);

    const setMarkerRef = (marker, key) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers((prev) => {
            if (marker) {
                return {...prev, [key]: marker};
            } else {
                const copy = {...prev};
                delete copy[key];
                return copy;
            }
        });
    };

    return (
        <>
            <Circle center={circleCenter} />
            {pois.map((poi) => (
                <AdvancedMarker
                    key={poi.key}
                    position={poi.location}
                    ref={(marker) => setMarkerRef(marker, poi.key)}
                    clickable
                    onClick={handleClick(poi.key)}
                >
                    <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
                </AdvancedMarker>
            ))}
        </>
    );
}