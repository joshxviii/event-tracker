import React, { useEffect, useState, useRef, use } from 'react';
import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';
import { PoiMarkers } from './poi-marker';

export function MapController( { focusedLocation } ) {
    const map = useMap();
    const hasCentered = useRef(false);
    const [defaultCenter, setDefaultCenter] = useState(focusedLocation ?? { lat: 0, lng: 0 });

    map.panTo(focusedLocation ?? defaultCenter);

    useEffect(() => {
        if (!map || hasCentered.current) return;

        if (!navigator?.geolocation) {
            console.warn('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
        (pos) => {
            const newCenter = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            setDefaultCenter(newCenter);
            map.panTo(newCenter);
            map.setZoom(10);

            hasCentered.current = true;
        },
        (err) => {
            console.warn('Geolocation failed or denied:', err?.message);
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
        );


    }, [map]);

    return (
        <div
            style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
            }}
        >
            <button onClick={() => {map.panTo(defaultCenter); map.setZoom(10);}} > Recenter </button>
        </div>
    );
}

export default function MapWidget( { focusedEventId, events, onPoiClick } ) {
    const myLocations = Array.isArray(events)
        ? events.reduce((dict, e) => {
            const lat = Number(e.location?.coordinates?.lat);
            const lng = Number(e.location?.coordinates?.lng);

            // Only include if lat/lng are valid numbers
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                const key = String(e._id);
                dict[key] = {
                    key,
                    location: { lat, lng },
                    category: e.category,
                    title: e.title,
                };
            }
            return dict;
            }, {})
        : {};

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Maps API loaded')}
            >
                <Map
                    disableDefaultUI={true}
                    controlled={false}
                    style={{ height: '30em' }}
                    defaultZoom={11}
                    defaultCenter={0}
                    // onCameraChanged={(ev) => {
                    //     try {
                    //         const c = ev?.detail?.center;
                    //         const z = ev?.detail?.zoom;
                    //         if (typeof onPoiClick === 'function') {
                    //             // noop; keep signature
                    //         }
                    //         if (typeof onPoiClick !== 'function' && false) {}
                    //         // emit viewport change if provided
                    //         if (typeof onPoiClick === 'function') {
                    //             // avoid lint
                    //         }
                    //     } catch (err) {
                    //         // ignore
                    //     }
                    // }}
                    mapId="da37f3254c6a6d1c"
                >
                    <PoiMarkers 
                        pois={ myLocations }
                        onPoiClick={onPoiClick}
                        circleCenter={ focusedEventId ? myLocations[focusedEventId]?.location : null }
                    />

                    <MapController focusedLocation={myLocations[focusedEventId]?.location}/>
                </Map>
            </APIProvider>
        </div>
    );
}


