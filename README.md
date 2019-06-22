# "Bridge Vue" in React

For instruction of hwo to build this application please refer to [original source](https://github.com/humphd/web422/tree/master/Code%20Examples/week5/bridge-react)
## Search Bar

To further your tacit knowledge React data flow, here's a feature we could minutely implement: a search input to filter our bridges.
+[Screencast of SearchBar in Action](screenshots/search-bar.gif)

We'll create new module `src/components/BridgeSearch.js` to hold the component, and add filtering logic to it's immediate parent `src/components/BridgeMenu`. 

> Manipulation of filtered bridges and re-rendering bridge listing will happen on behalf of `BridgeMenu` primarily because of it's disposition
### `src/components/BridgeSearch.js`
```jsx harmony
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

export default function BridgeSearch(props) {
    const useStyles = makeStyles(theme => ({
        search: {
            position: 'relative',
            width: '100%',
        },
        searchIcon: {
            width: theme.spacing(4),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 4),
            width: '100%',
        }
    }));
    const classes = useStyles();

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
            <InputBase
                onChange={props.selectBridge}
                placeholder="Name a bridge..."
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
            />
        </div>
    );
}
```
Noteworthy, Material-UI components like `SearchIcon` and `InputBase` work without any additional setup, i.e. global scope is not polluted with namespaces, and components are isolated. Injection of styles happens on React module level.

`makeStyles` is a hook provided by `@material-ui/core/`, being supplied with default _Material_ theme, enables us to inject CSS styles into isolated components via `className` attribute. It's succinct to store all required style rules in the the same module.

Newly created `BridgeSearch` is a stateless functional component that passes `onChange` event object up his parent as an argument to `props.selectBridge` function, i.e. each time we type in search bar, this function is invoked with `event` argument.

I also feature `Loader` that will fill up time required for our API in `bridges.js` to be fetched. `Loader` component is conventionally separated into it's own module `src/components/Loader.js`
> DRY or "Don't repeat yourself", is a common practice readily applied to react world, where components are [composable](https://reactjs.org/docs/composition-vs-inheritance.html) and reusable.

### `src/components/BridgeMenu.js`
Let's now modify `BridgeMenu` to handle this invocation, so that updated bridge listing is rendered. Loader component will light the stage whenever `state.loading` is true.
```jsx harmony
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
        if (this.state.errored) return 'Unable to load bridge data';

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
```
### `src/components/Loader.js`
[Material-UI Circular Progress](https://material-ui.com/components/progress/) is a component provided by the library. 
> These styling classes may be received as props coming from parent. In our case, bridge-vue-react application was not designed to work with Material-UI, and that's okay, for React enables us to create isolated standalone components ready for re-use.
```jsx harmony
import {makeStyles} from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import React from 'react'

const useStyles = makeStyles(theme => ({
    bridgeLoader: {
        'position': 'relative',
        'margin-top': '50%'
    },
    bridgeMenu: {
        'text-align': 'center',
    }
}));

export default function() {
    const classes = useStyles();
    return (
        <div className={classes.bridgeMenu}>
            <CircularProgress className={classes.bridgeLoader} />
        </div>
    );
}
```

