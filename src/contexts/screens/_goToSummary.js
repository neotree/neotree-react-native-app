export default function goToSummary(_payload = {}) {
  this.setState({ sessionSummary: this.createSessionSummary({ completed: true, }) });
  this.router.history.push(`/script/${this.script.id}/preview-form`);
}
