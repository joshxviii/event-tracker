import React from 'react';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import { PoiMarkers } from './poi-marker';

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

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onLoad={() => console.log('Maps API loaded')}
            >
                <Map
                    style={{ width: '50em', height: '40em' }}
                    defaultZoom={11}
                    defaultCenter={{ lat: 40.789142, lng: -73.13496 }}
                    
                    mapId="da37f3254c6a6d1c"
                    // onCameraChanged={(ev) =>
                    //     console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
                    // }
                >
                    <PoiMarkers 
                        pois={ myLocations }
                        onPoiClick={onPoiClick}
                    />
                </Map>
            </APIProvider>
        </div>
    );
}


