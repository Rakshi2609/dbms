export const formatDateTime = (value) => {
  if (!value) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

export const toInputDateTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};
