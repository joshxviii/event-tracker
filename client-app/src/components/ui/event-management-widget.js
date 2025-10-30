import React from "react"
import {ReactComponent as DeleteIcon} from '../../assets/delete.svg';
import {ReactComponent as EditIcon} from '../../assets/edit.svg';

export function EventManagementWidget( {event} ) {

  return (
    <div class="eventWidget">
        <h1> { event.title } </h1>
        <p> { event.description } </p>
        <p> Event ID: { event._id } </p>
        <p> Date: { event.date } </p>
        <p> Time: { event.startTime } - { event.endTime } </p>
        <p> Location: { event.location.address } </p>
        <p> Category: { event.category } </p>

        <div class="buttonGroup">
          <button onClick={() => alert('Edit not implemented')}><EditIcon/> Edit Event</button>
          <button onClick={() => alert('Edit not implemented')}><DeleteIcon /> Delete Event </button>
        </div>
    </div>
  );
}