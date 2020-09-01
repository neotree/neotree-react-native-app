export default function initialiseScreens () {
    this.setState({ screensInitialised: false, initialisingScreens: true });

    const done = () => this.setState({ 
        screensInitialised: true, 
        initialisingScreens: false 
    });
    
    Promise.all([
        this.getScreens(),
        this.getSessionsStats(),
        this.getConfiguration(),
    ]).then(done).catch(done);
}
