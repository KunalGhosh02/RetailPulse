export const getFormattedDate = (date: Nullable<string>) => {
  if (!date) {
    return '';
  }
  return Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    minute: 'numeric',
    hour: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour12: true,
  }).format(Date.parse(date));
};
