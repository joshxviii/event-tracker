import React, { useEffect, useState, useRef, use } from 'react';
import {APIProvider, Map, AdvancedMarker, useMap} from '@vis.gl/react-google-maps';

export default function EventMapWidget( { lat, lng } ) {

    return (
        <div style={{width: '100%', height: '100%'}} >
            <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Maps API loaded')}
            >
            
                <Map
                    disableDefaultUI={true}
                    controlled={true}
                    style={{height: '18em' }}
                    zoom={11}
                    center={lat && lng ? { lat: parseFloat(lat),  lng: parseFloat(lng) } : { lat: 0, lng: 0 }}
                    mapId="db37f3254e6a6d1b"
                >

                { (lat && lng) &&
                    <AdvancedMarker
                        position={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
                    />
                }

                </Map>
            </APIProvider>
        </div>
    );
}


