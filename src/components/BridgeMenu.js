import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import MenuItem from './MenuItem.js'
import getBridgeData from '../bridges.js'
import BridgeSearch from './BridgeSearch.js'

const useStyles = makeStyles(theme => ({
    bridgeLoader: {
        margin: theme.spacing(2),
        'position': 'relative',
        'margin-top': '50%'
    },
    bridgeMenu: {
        'text-align': 'center',
    }
}));

function Loader() {
    const classes = useStyles();
    return (
    <div className={classes.bridgeMenu}>
        <CircularProgress className={classes.bridgeLoader} />
    </div>
    );
}

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
            .then(bridges => this.setState({ loading: false, bridges, filteredBridges: bridges }))
            .catch(err => {
                console.error('Unable to load bridge data', err.message);
                this.setState({ errored: true });
            });
    }

    handleBridgeSearch (searchEvent) {
        let search = searchEvent.target.value;

        if (!search) return this.setState({filteredBridges: this.state.bridges});

        let filteredBridges =
            this.state.bridges.filter(bridge =>
                bridge.name.toLowerCase()
                    .includes(search.toLowerCase()));
        return this.setState({filteredBridges});
    }
    render() {
        // Are we in an error state? If so show an error message.
        if (this.state.errored) {
            return (
                <div>
                    <p>Error: unable to load bridge data</p>
                </div>
            );
        }

        // If we aren't in error state, are we in a loading state?
        if (this.state.loading) return <Loader />;

        // Show our bridges in a menu, with 1 MenuItem per bridge
        return (
            <React.Fragment>
                <BridgeSearch selectBridge={this.handleBridgeSearch}/>
                {
                    this.state.filteredBridges.length ? this.state.filteredBridges.map(bridge =>
                <MenuItem
                    key={bridge.id}
                    bridge={bridge}
                    onClick={() => this.props.onChange(bridge)}
                />
                    ) : <div>test</div>
                }
            </React.Fragment>
        )
    };
}
