import { getUID } from '@/api/uid';

export default function initialiseScreens () {
    this.setState({ screensInitialised: false, initialisingScreens: true });

    const done = (e, rslts) => {
        this.setState({ 
            screensInitialised: true, 
            initialisingScreens: false,
            ...(e ? null : { uid: rslts[0], }), 
        });
    }
    
    Promise.all([
        getUID(),
        this.getScreens(),
        this.getConfiguration(),
    ]).then(rslts => done(null, rslts)).catch(done);
}
