export function Loading({}) {
    return (
        <div style={{ margin:"16px", textAlign:"center"}}>
            <svg width="48" height="48" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="25" cy="25" r="20" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                <path d="M45 25a20 20 0 0 1-20 20" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" fill="none">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                </path>
            </svg>
        </div>
    );
}