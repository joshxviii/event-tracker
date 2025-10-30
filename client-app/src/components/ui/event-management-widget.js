import React from "react"
import {ReactComponent as DeleteIcon} from '../../assets/delete.svg';
import {ReactComponent as EditIcon} from '../../assets/edit.svg';

export function EventManagementWidget( {event, onEdit, onDelete} ) {

  return (
    <div className="eventWidget">
        <h1> { event.title } </h1>
        <p> { event.description } </p>
        <p> Event ID: { event._id } </p>
        <p> Start: { event.startAt ? new Date(event.startAt).toLocaleString() : 'N/A' } </p>
        <p> End: { event.endAt ? new Date(event.endAt).toLocaleString() : 'N/A' } </p>
        <p> Location: { event.location?.address } </p>
        <p> Category: { event.category } </p>

        <div className="buttonGroup">
          <button onClick={() => onEdit ? onEdit(event._id) : null}><EditIcon/> Edit Event</button>
          <button onClick={() => onDelete ? onDelete(event._id) : null}><DeleteIcon /> Delete Event </button>
        </div>
    </div>
  );
}