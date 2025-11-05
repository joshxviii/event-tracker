import React from "react"
import {ReactComponent as DeleteIcon} from '../../assets/delete.svg';
import {ReactComponent as EditIcon} from '../../assets/edit.svg';
import { delete_event } from "../../utils/requests/event";
import { useNotifications } from './Notifications';

export function EventManagementWidget( {event, onEdit, onDelete} ) {
  const notify = useNotifications();

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
          <button onClick={async () => {
            if (!window.confirm(`Delete '${event.title}'?\nThis can not be undone.`)) return;
            try {
              await delete_event(event._id);
              if (notify && notify.push) notify.push({ type: 'success', message: `Deleted: ${event.title}` });
              if (typeof onDelete === 'function') onDelete(event._id);
            } catch (err) {
              console.error('Failed to delete event', err);
              if (notify && notify.push) notify.push({ type: 'error', message: `Failed to delete: ${err.message || 'unknown error'}` });
              else alert('Failed to delete event: ' + (err.message || 'unknown error'));
            }
          }}><DeleteIcon /> Delete Event </button>
        </div>
    </div>
  );
}