export default function initialiseScript() {
    this.setState({ scriptInitialised: false, initialisingScript: true });

    const done = () => this.setState({ 
        scriptInitialised: true, 
        initialisingScript: false 
    });
    
    Promise.all([
        this.getScript(),
        this.getDiagnoses(),
    ]).then(done).catch(done);
}
