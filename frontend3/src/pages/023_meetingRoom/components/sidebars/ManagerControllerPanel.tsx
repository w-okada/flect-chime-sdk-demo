import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Link, makeStyles, Tooltip, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { HMMCmd, HMMMessage } from '../../../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM';
import { getDateString } from '../../../../utils';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';

type StatusData = {
    timestamp: number,
    active: boolean,
    recording: boolean,
}


  
export const ManagerControllerPanel = () => {
    const classes = useStyles();
    const {updateMeetingInfo, ownerId, isOwner, publicIp,
          startHMM, sendTerminate, sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, hMMStatus, stateLastUpdate,
          amongUsStates
        } = useAppState()

    const ownerStateComp = useMemo(()=>{
        return (
            isOwner?
            <>
                <Tooltip title={"Your are owner"}>
                    <EmojiPeopleIcon className={classes.activeState}/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"Your are not owner"}>
                    <EmojiPeopleIcon className={classes.inactiveState}/>
                </Tooltip>
            </>
        )
    },[isOwner])

    const managerStateComp = useMemo(()=>{
        return (
            hMMStatus.active?
            <>
                <Tooltip title={"hmm active"}>
                    <SportsEsportsIcon className={classes.activeState}/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"hmm not active"}>
                    <SportsEsportsIcon className={classes.inactiveState}/>
                </Tooltip>
            </>
        )
    },[hMMStatus.active])

    const recordingStateComp = useMemo(()=>{
        return (
            hMMStatus.recording?
            <>
                <Tooltip title={"recording"}>
                    <CameraRollIcon className={classes.activeState}/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"not recording"}>
                    <CameraRollIcon className={classes.inactiveState}/>
                </Tooltip>
            </>
        )
    },[hMMStatus.recording])

    const shareTileViewStateComp = useMemo(()=>{
        return (
            hMMStatus.shareTileView?
            <>
                <Tooltip title={"share tile view"}>
                    <ScreenShareIcon className={classes.activeState}/>
                </Tooltip>
            </>
            :
            <>
                <Tooltip title={"not share share tile view"}>
                    <ScreenShareIcon className={classes.inactiveState}/>
                </Tooltip>
            </>
        )
    },[hMMStatus.shareTileView])
    
    const stateLastUpdateTime = useMemo(()=>{
        const datetime = new Date(stateLastUpdate);
        const d = datetime.toLocaleDateString()
        const t = datetime.toLocaleTimeString()
        // return `${d} ${t}`
        return `${t}`
    },[stateLastUpdate])

    useEffect(()=>{
        console.log(`AMONG: ${amongUsStates.slice(-1)[0]}`)
        // console.log("AMONG:", amongUsStates.slice(-1)[0])
    },[amongUsStates])

    return (
            <div className={classes.root}>                
                <Typography variant="body1" color="textSecondary">
                    Manager 
                </Typography>
                {ownerStateComp}
                {managerStateComp}
                {recordingStateComp}
                {shareTileViewStateComp}

                <br/>
                lastupdate:{stateLastUpdateTime}


                <br/>

                <Button size="small" className={classes.margin} onClick={()=>{startHMM()}} >
                    run manager
                </Button>
                <Button size="small" className={classes.margin} onClick={()=>{ sendTerminate() }}>
                    stop manager
                </Button>

                <Button size="small" className={classes.margin} onClick={()=>{sendStartRecord()}}>
                    start recording
                </Button>
                <Button size="small" className={classes.margin} onClick={()=>{sendStopRecord()}}>
                    stop recording
                </Button>

                <Button size="small" className={classes.margin} onClick={()=>{sendStartShareTileView()}}>
                    start share tileview
                </Button>
                <Button size="small" className={classes.margin} onClick={()=>{sendStopShareTileView()}}>
                    stop share tileview
                </Button>
                <div>
                    <a onClick={()=>{updateMeetingInfo()}}>updateMeetingInfo</a>
                    <br/>
                    Owner:{ownerId}
                    <br />
                    {publicIp? `publicIp ${publicIp}`:""}
                </div>


            </div>

    );
}

 