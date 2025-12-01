import { useNavigate } from "react-router-dom";

export function AttendeeWidget( { attendees } ) {
    const navigate = useNavigate();
    const maxAvatars = 5;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{ fontSize: 13, color: '#666' }}> {attendees.length} {attendees.length === 1 ? 'attendee' : 'attendees'}</div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflow: 'hidden' }}>
            {attendees.slice(0, maxAvatars).map((a, idx) => {
                const key = a && (a._id || a) || idx;
                const pic = a && a.profilePicture;
                const name = a && (a.username) || String(a || '');
                return (
                <div key={key} title={name} onClick={() => navigate(`/user/${a._id}`)} style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flex: '0 0 auto' }}>
                    {pic ? (
                    <img src={pic} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                    <div className="nullPicture" style={{ width: 32, height: 32, borderRadius: 6, fontSize: 12 }}>{(name || '').charAt(0).toUpperCase()}</div>
                    )}
                </div>
                );
            })}
            {attendees.length > maxAvatars && (
                <div style={{ fontSize: 13, color: '#666' }}>+{attendees.length - maxAvatars}</div>
            )}
            </div>
        </div>
    )

}
