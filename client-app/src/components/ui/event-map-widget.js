import React, { useEffect, useRef } from 'react';
import {APIProvider, Map, AdvancedMarker, useMap} from '@vis.gl/react-google-maps';

function RecenterController({ center }) {
    const map = useMap();
    const recenterTimer = useRef(null);

    useEffect(() => {
        if (!map) return;

        const onDragStart = () => {
            if (recenterTimer.current) {
                clearTimeout(recenterTimer.current);
                recenterTimer.current = null;
            }
        };

        const onDragEnd = () => {
            if (recenterTimer.current) clearTimeout(recenterTimer.current);
            recenterTimer.current = setTimeout(() => {
                map.panTo(center);
                recenterTimer.current = null;
            }, 400);
        };

        const startListener = map.addListener && map.addListener('dragstart', onDragStart);
        const endListener = map.addListener && map.addListener('dragend', onDragEnd);

        return () => {
            try { startListener && startListener.remove && startListener.remove(); } catch (e) {}
            try { endListener && endListener.remove && endListener.remove(); } catch (e) {}
            if (recenterTimer.current) { clearTimeout(recenterTimer.current); recenterTimer.current = null; }
        };
    }, [map, center]);

    return null;
}

export default function EventMapWidget( { style, lat, lng } ) {

    const center = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : { lat: 0, lng: 0 };

    return (
        <div style={style} >
            <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Maps API loaded')}
            >
                <Map
                    disableDefaultUI={true}
                    controlled={false}
                    style={{height: '18em'}}
                    defaultZoom={11}
                    defaultCenter={center}
                    mapId="db37f3254e6a6d1b"
                >

                { (lat && lng) &&
                    <AdvancedMarker
                        position={center}
                    />
                }
                <RecenterController center={center} />

                </Map>
            </APIProvider>
        </div>
    );
}


