import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const lineSpacerHeihgt = 10

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            fontSize: 14,
        },
        lineSpacer:{
            height:lineSpacerHeihgt,
        },
    }),
    
);

export const CreditPanel = () => {
    const classes = useStyles();
    return (
        <div style={{ height: '100%', width: "100%", wordWrap: "break-word", whiteSpace: "normal" }}>
            <Typography variant="body1" color="textSecondary">
                About us
            </Typography>
            <Typography variant="body2">
                This program is powered by <a href="https://www.flect.co.jp/">FLECT</a>. <br/><a href="https://github.com/w-okada/flect-chime-sdk-demo">github</a>
            </Typography>
            
            <div className={classes.lineSpacer} />
            <div className={classes.lineSpacer} />

            <Typography variant="body1" color="textSecondary">
                Acknowledgment
            </Typography>
            <Typography variant="body2">
                This program uses the musics and sound effects from <a href="https://otologic.jp">OtoLogic</a>
            </Typography>
            <Typography variant="body2">
                This program uses the images from <a href="https://www.irasutoya.com/">irasutoya</a>
            </Typography>
        </div>
    );
}