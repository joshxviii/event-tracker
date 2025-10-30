import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useMap, AdvancedMarker, Pin} from '@vis.gl/react-google-maps';
import {MarkerClusterer} from '@googlemaps/markerclusterer';
import { Circle } from './circle';

export function PoiMarkers( { pois, onPoiClick } ) {
    const map = useMap();
    const [markers, setMarkers] = useState({});
    const clusterer = useRef(null);
    const [circleCenter, setCircleCenter] = useState(null);

    const handleClick = useCallback(
        (key) => (ev) => {
            if (!map) return;
            if (ev && ev.latLng) {
                map.panTo(ev.latLng);
                setCircleCenter(ev.latLng);
            }
            if (onPoiClick) onPoiClick(key);
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
            {pois.map((poi) => {
                const category = poi.category || 'other';
                const colorMap = {
                    volunteer: 'var(--event-color-volunteer)',
                    social: 'var(--event-color-social)',
                    market: 'var(--event-color-market)',
                    other: 'var(--event-color-other)'
                };
                const bg = colorMap[category] || 'var(--event-color-other)';
                return (
                    <AdvancedMarker
                        title={poi.title} 
                        key={poi.key}
                        position={poi.location}
                        ref={(marker) => setMarkerRef(marker, poi.key)}
                        clickable
                        onClick={handleClick(poi.key)}
                    >
                        <div className="poiMarker"  style={{backgroundColor: 'red'}}>
                            <Pin background={bg} glyphColor={'#0000007c'} borderColor={'#000000ff'} />

                        </div>
                    </AdvancedMarker>
                );
            })}
        </>
    );
}