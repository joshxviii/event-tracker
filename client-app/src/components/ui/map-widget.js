import React, { useEffect, useState, useRef, use } from 'react';
import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';
import { PoiMarkers } from './poi-marker';

export function MapController() {
    const map = useMap();
    const hasCentered = useRef(false);
    const [defaultCenter, setDefaultCenter] = useState({ lat: 0, lng: 0 });

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
            <button onClick={() => {map.panTo(defaultCenter); map.setZoom(10);}} > Reset </button>
        </div>
    );
}

export default function MapWidget( { events, onPoiClick } ) {
    // Data from csv list
    const myLocations = Array.isArray(events)
        ? events
              .map((e) => {
                  const lat = Number(e.location?.coordinates?.lat);
                  const lng = Number(e.location?.coordinates?.lng);
                  return {
                      key: String(e._id),
                      location: { lat, lng },
                      category: e.category,
                      title: e.title
                  };
              })
              .filter((p) => !Number.isNaN(p.location.lat) && !Number.isNaN(p.location.lng))
        : [];

    const initialPanDone = useRef(false);

    // ask browser for geolocation on mount; this will prompt user for permission

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Maps API loaded')}
            >
                <Map
                    disableDefaultUI={true}
                    controlled={false}
                    style={{ width: '50em', height: '30em' }}
                    defaultZoom={11}
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
                    />

                    <MapController />
                </Map>
            </APIProvider>
        </div>
    );
}


