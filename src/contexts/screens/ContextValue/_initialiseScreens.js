export default function () {
    return new Promise((resolve, reject) => {
        this.setState({ screensInitialised: false, initialisingScreens: true });

        const done = () => this.setState({ 
            screensInitialised: true, 
            initialisingScreens: false 
        });
        
        Promise.all([
            this.getScreens(),
        ]).then(done).catch(done);
    });
}
