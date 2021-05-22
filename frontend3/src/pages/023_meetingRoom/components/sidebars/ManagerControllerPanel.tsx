import React, { useMemo, useState } from 'react';
import { Link, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { startManager } from '../../../../api/api';

export const ManagerControllerPanel = () => {
    const classes = useStyles();
    const { meetingName, attendeeId, idToken, accessToken, refreshToken, sendCommand} = useAppState()
    const [ url, setURL] = useState<string>()
    // const [onetimeCode, setOnetimeCode] = useState<string>()

    const handleStartManagerClicked = async () =>{
        const res = await startManager(meetingName!, attendeeId!, idToken!, accessToken!, refreshToken!)
        console.log("start manager",res)
        const url = res['url']
        const host = window.location.hostname
        if(url.indexOf(host) != -1){
            setURL(url)
        }else{
            const noProtocolUrl = url.substring("https://".length)
            const paramString   = noProtocolUrl.substring(noProtocolUrl.indexOf("/"))
            const newUrl = `https://192.168.0.4:3000${paramString}`
            console.log("NEWURL", newUrl)
            setURL(newUrl)
        }

    }

    return (
            <div className={classes.root}>
                <Typography variant="body1" color="textSecondary">
                    Manager
                </Typography>

                <Link onClick={(e: any) => { handleStartManagerClicked() }}>
                    startManager
                </Link>

                <Typography variant="body1" color="textSecondary">
                    <a href={url}  target="_blank" rel="noopener noreferrer">{url}</a>
                </Typography>

                <a onClick={()=>{sendCommand("clicked!!!!!afasfasdfasdf")}}>sendCommand</a>


            </div>

    );
}

 