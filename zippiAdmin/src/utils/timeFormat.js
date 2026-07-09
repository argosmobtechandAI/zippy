export const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    
    // Handle ranges like "09:00 - 10:30"
    if (timeString.includes('-')) {
        const parts = timeString.split('-');
        return parts.map(p => formatTime12Hour(p.trim())).join(' - ');
    }

    // Handle single time like "14:00" or "14:00:00"
    const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})/);
    if (!timeMatch) return timeString; // Return original if it doesn't match

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    // Pad hours with leading zero if needed, to keep it neat (optional, standard 12-hour often drops it)
    const strHours = hours < 10 ? '0' + hours : hours;
    
    return `${strHours}:${minutes} ${ampm}`;
};
