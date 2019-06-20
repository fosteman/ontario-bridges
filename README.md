# "Bridge Vue" in React

For instruction of hwo to build this application please refer to [original source](https://github.com/humphd/web422/tree/master/Code%20Examples/week5/bridge-react)
## Search Bar

To further your tacit knowledge React data flow, here's a feature we could minutely implement: a search input to filter our bridges.
+[Screencast of SearchBar in Action](screenshots/search-bar.gif)

We'll create new module `src/components/BridgeSearch.js` to hold components and logic for the SearchBar. 

_Note_: manipulation of filtered bridges and re-rendering BridgeMenu will happen on behalf of `BridgeMenu` primarily because of Semantic disposition 
> It is obvious that BridgeMenu controls it's children, thus it will define filtering logic
```bash
touch src/components/BridgeSearch.js
```
### `src/components/BridgeSearch.js`
```jsx harmony
import React, {useState} from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
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
Noteworthy, Material-UI components like `SearchIcon` and `InputBase` work without any additional setup - global scope is not polluted with namespaces, and components are isolated. Injection of styles happens on React module level.

`makeStyles` is a hook provided by `@material-ui/core/`, being supplied with default _Material_ theme, enables us to inject CSS styles into isolated components via `className` attribute. It's concise to store all required style rules in the the same module.

This is stateless functional component that passes `onChange` event information up his parent as an arguement via `props.selectBridge` function, i.e. each time we type in search bar, this function is invoked with `event` argument.

I also feature `Loader` component that will

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
                <BridgeSearch selectBridge={this.handleBridgeSearch}
                />

                {
                    this.state.filteredBridges.length ?
                        this.state.filteredBridges
                            .map(bridge =>
                <MenuItem
                    key={bridge.id}
                    bridge={bridge}
                    onClickabstract={() => this.props.onChange(bridge)}
                />
                    )
                        : <div>TODO: Nothing Selected!</div>
                }
            </React.Fragment>
        )
    };
}
```


