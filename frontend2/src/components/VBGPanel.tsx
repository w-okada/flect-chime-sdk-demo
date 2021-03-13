import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {  useMeetingState } from '../providers/MeetingStateProvider';
import { Grid, Slider, Typography } from '@material-ui/core';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: '100%',

        },
        container: {
            maxHeight: `calc(100% - 10px)`,
        },
        paper: {
            width: '100%',
            marginBottom: theme.spacing(2),
            maxHeight: `calc(100% - 10px)`,
            orverflow: 'scroll',

        },
        margin: {
            margin: theme.spacing(1),
        },
        title: {
            fontSize: 14,
        },
        selectedColor:{
            border: "1px solid",
            borderRadius: "4px",
        },
        color:{
        }
    }),
);

export const VBGPanel = () => {
    const classes = useStyles();
    const { videoInputDeviceSetting } = useMeetingState()
    const [ JBFSize, setJBFSize] = React.useState(256);

    const handleJBFSizeChange = (event: any, newValue: number | number[]) => {
        if(typeof(newValue)==="number"){
            videoInputDeviceSetting?.setJBFSize(newValue, newValue)
            setJBFSize(newValue);
        }else if(Array.isArray(newValue)){
            videoInputDeviceSetting?.setJBFSize(newValue[0], newValue[0])
            setJBFSize(newValue[0]);
        }
    };

    useEffect(()=>{
        videoInputDeviceSetting?.setJBFSize(JBFSize, JBFSize)
    })

    return (
        <div style={{ height: '100%', width: "100%", wordWrap: "break-word", whiteSpace: "normal"}}>
            <Typography id="continuous-slider" gutterBottom>
                jbf_size
            </Typography>
            <Grid container spacing={2}>
                {JBFSize}
                <Grid item xs>
                    <Slider value={JBFSize} onChange={handleJBFSizeChange} min={128} max={512} step={1} />
                </Grid>
            </Grid>
        </div>
    );
}