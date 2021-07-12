import React, { useEffect, useMemo,} from 'react';
import { Button, Tooltip, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import CameraRollIcon from '@material-ui/icons/CameraRoll';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';

  
export const ManagerControllerPanel = () => {
    const classes = useStyles();
    const { chimeClient, amongusGameState } = useAppState()

    const ownerStateComp = useMemo(()=>{
        return (
            chimeClient!.isOwner?
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
    },[chimeClient!.isOwner])  // eslint-disable-line

    const managerStateComp = useMemo(()=>{
        return (
            chimeClient!.hmmClient!.hmmActive?
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
    },[chimeClient!.hmmClient!.hmmActive])  // eslint-disable-line

    const recordingStateComp = useMemo(()=>{
        return (
            chimeClient!.hmmClient!.hmmRecording?
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
    },[chimeClient!.hmmClient!.hmmRecording])  // eslint-disable-line

    const shareTileViewStateComp = useMemo(()=>{
        return (
            chimeClient!.hmmClient!.hmmShareTileview?
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
    },[chimeClient!.hmmClient!.hmmShareTileview])  // eslint-disable-line
    
    const stateLastUpdateTime = useMemo(()=>{
        const datetime = new Date(chimeClient!.hmmClient!.hmmLastUpdate);
        // const d = datetime.toLocaleDateString()
        const t = datetime.toLocaleTimeString()
        // return `${d} ${t}`
        return `${t}`
    },[chimeClient!.hmmClient!.hmmLastUpdate])

    useEffect(()=>{
        console.log(amongusGameState)
        // console.log("AMONG:", amongUsStates.slice(-1)[0])
    },[amongusGameState])
   

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

                <br/>

                <Button size="small" className={classes.margin} onClick={()=>{ chimeClient!.hmmClient!.startHMM() }} >
                    run manager
                </Button>
                <Button size="small" className={classes.margin} onClick={()=>{ chimeClient!.hmmClient!.sendTerminate() }}>
                    stop manager
                </Button>

                <Button size="small" className={classes.margin} onClick={()=>{ chimeClient!.hmmClient!.sendStartRecord()}}>
                    start recording
                </Button>
                <Button size="small" className={classes.margin} onClick={()=>{ chimeClient!.hmmClient!.sendStopRecord()}}>
                    stop recording
                </Button>

                <Button size="small" className={classes.margin} onClick={()=>{ chimeClient!.hmmClient!.sendStartShareTileView()}}>
                    start share tileview
                </Button>
                <Button size="small" className={classes.margin} onClick={()=>{ chimeClient!.hmmClient!.sendStopShareTileView()}}>
                    stop share tileview
                </Button>
                <div>
                    { chimeClient?.hmmClient?.hmmPublicIp ? chimeClient?.hmmClient?.hmmPublicIp:"no ip"}
                </div>


            </div>

    );


    return(<></>)
}

 