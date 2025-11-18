import React from 'react';
import { EventEditPage } from './EventEditPage';

export const EventCreationPage = (props) => {
  // Render the unified EventEditPage without an eventId to create a new event
  return <EventEditPage {...props} />;
};