import React from 'react'
import MenuItem from './MenuItem.js'
import getBridgeData from '../bridges.js'
import BridgeSearch from './BridgeSearch.js'
import Loader from './Loader'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            errored: false,
            bridges: [],
            filteredBridges: []
        };
        this.handleBridgeSearch = this.handleBridgeSearch.bind(this);
    }

    componentDidMount() {
        // We're about to start loading our data, set this in our state.
        this.setState({ loading: true });

        // Use our bridge.js function to talk to the REST API.
        getBridgeData()
            .then(bridges => this.setState({ loading: false, bridges, filteredBridges: bridges, error: '' }))
            .catch(err => {
                console.error('Unable to load bridge data', err.message);
                this.setState({ errored: true, message: err.message });
            });
    }

    handleBridgeSearch (searchEvent) {
        // If nothing is entered return complete list
        if (!searchEvent.target.value) return this.setState({filteredBridges: this.state.bridges});

        // Otherwise, grab search value in upperCase...
        let search = searchEvent.target.value.toUpperCase();

        // ...and filter bridges out by updating state with the return value of .include method, regex alternative of which: new RegExp(/+search+/)
        return this.setState({
            filteredBridges: this.state.bridges
                .filter(bridge => bridge.name.includes(search))
        });
    }

    render() {
        // Are we in an error state? If so show an error message.
        if (this.state.errored) return <Error message='Unable to load bridge data' />;

        // If we aren't in error state, are we in a loading state?
        if (this.state.loading) return <Loader />;

        // Show our search bar, bridge listing, with 1 MenuItem per bridge
        return (
            <React.Fragment>
                <BridgeSearch selectBridge={this.handleBridgeSearch} />
                {
                    this.state.filteredBridges.length ?
                        this.state.filteredBridges.map(bridge =>
                            <MenuItem
                                key={bridge.id}
                                bridge={bridge}
                                onClick={() => this.props.onChange(bridge)}
                            />
                            ) : 'Not found!'
                }
            </React.Fragment>
        )
    };
}
