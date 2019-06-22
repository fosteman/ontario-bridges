import {makeStyles} from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import React from 'react'

// TODO: Material-UI explanation
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
