import queryString from 'query-string';

export default function goToSummary(_payload = {}) {
  const { history, location } = this.router;
  const summaryLink = `${location.pathname}?${queryString.stringify({ ...queryString.parse(location.search), displaySummary: 'yes' })}`;

  this.setState({ sessionSummary: this.createSessionSummary({ completed: true, }) });
  
  this.router.history.push(summaryLink);
}
