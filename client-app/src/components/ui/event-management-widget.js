import React from "react"
import {ReactComponent as DeleteIcon} from '../../assets/delete.svg';
import {ReactComponent as EditIcon} from '../../assets/edit.svg';
import { delete_event } from "../../utils/requests/event";
import { useNotifications } from './Notifications';
import { AttendeeWidget } from "./attendee-widget";
import { useNavigate } from "react-router-dom";

export function EventManagementWidget( {event, onEdit, onDelete} ) {
  const notify = useNotifications();
  const navigate = useNavigate();

  const handleDelete = async () => {
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
  };

  const thumbUrl = event.imageUrl || event.image || event.banner || event.eventImage || null;

  return (
    <div className="eventWidget eventManagementWidget">
      <div className="eventThumb">
        {thumbUrl ? (
          <img src={thumbUrl} alt={event.title} className="eventThumbImg" />
        ) : (
          <div className="nullPicture" style={{ width: 96, height: 72, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(event.title || '').charAt(0).toUpperCase()}</div>
        )}
      </div>

      <div className="eventContent">
        <div style={{ display: 'flex', gap: 8}}>
          
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h3 className="eventHeader">{event.title}</h3>
            <p style={{ marginTop: 6, marginBottom: 6, color: 'var(--text-color-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.description}</p>

            <div style={{ display: 'flex', flexDirection:'column', gap: 12, fontSize: 13, color: 'var(--text-color-2)' }}>
              <div>Start: { event.startAt ? new Date(event.startAt).toLocaleString() : 'N/A' }</div>
              <div>End: { event.endAt ? new Date(event.endAt).toLocaleString() : 'N/A' }</div>
              <div>{ event.location?.address || '' }</div>
            </div>

            <br/>
            <AttendeeWidget attendees={event.attendees || []} />

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div className="eventLabel" style={{ backgroundColor: 'var(--event-color-' + (event.category || 'other') + ')' }}>{event.category || 'other'}</div>
            <div className="buttonGroup" style={{ flexDirection: 'column'}}>
              <button onClick={() => onEdit ? onEdit(event._id) : null}><EditIcon/> Edit</button>
              <button onClick={handleDelete}><DeleteIcon/> Delete</button>
              <button onClick={() => navigate(`/event/${event._id}`)}>View Event</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}