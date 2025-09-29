import {useEffect, useRef} from 'react';
import {useMap} from '@vis.gl/react-google-maps';

export default function Circle({
                                   center,
                                   radius = 800,
                                   strokeColor = '#0c4cb3',
                                   strokeOpacity = 1,
                                   strokeWeight = 3,
                                   fillColor = '#3b82f6',
                                   fillOpacity = 0.3
                               }) {
    const map = useMap();
    const circleRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        // cleanup previous
        if (circleRef.current) {
            circleRef.current.setMap(null);
            circleRef.current = null;
        }
        if (!center) return;

        circleRef.current = new window.google.maps.Circle({
            map,
            center,
            radius,
            strokeColor,
            strokeOpacity,
            strokeWeight,
            fillColor,
            fillOpacity
        });

        return () => {
            if (circleRef.current) {
                circleRef.current.setMap(null);
            }
        };
    }, [map, center, radius, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity]);

    return null;
}
