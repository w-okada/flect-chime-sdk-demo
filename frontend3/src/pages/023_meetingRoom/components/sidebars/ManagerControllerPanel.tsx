import React, { useEffect, useMemo, useState } from 'react';
import { Link, Typography } from '@material-ui/core';
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { HMMCmd, HMMMessage } from '../../../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM';
import { getDateString } from '../../../../utils';

type StatusData = {
    timestamp: number,
    active: boolean,
    recording: boolean,
}

export const ManagerControllerPanel = () => {
    const classes = useStyles();
    const {sendHMMCommand, hMMCommandData, updateMeetingInfo, ownerId, isOwner,
        startHMM, updateHMMInfo, publicIp,
        sendStartRecord, sendStopRecord, sendStartShareTileView, sendStopShareTileView, sendTerminate, sendHMMStatus
        } = useAppState()
    const [ statusData, setStatusData ] = useState<StatusData>()


    useEffect(()=>{
        console.log("receive HMMCommandData 0" )
        if(hMMCommandData.length === 0){
            return
        }
        const latestCommand = hMMCommandData.slice(-1)[0]
        console.log("receive HMMCommandData 1 ",hMMCommandData )
        const mess = latestCommand.data as HMMMessage
        console.log("receive HMMCommandData 2 ", mess)
        console.log("receive HMMCommandData 3 ", mess.command)
        
        if(mess.command === "NOTIFY_STATUS"){
            const statusData:StatusData={
                timestamp:new Date().getTime(),
                active: true,
                recording: true
            }
            setStatusData(statusData)
        }
    },[hMMCommandData])


    const hmmstatus = useMemo(()=>{
        if(!statusData){
            return (<>no status data</>)
        }
        const dateString = getDateString(statusData.timestamp)
        return(
            <>
                lastupdate:{dateString}, recording:{statusData.recording ? "yes":"no"}
            </>
        )

    },[statusData])

    return (
            <div className={classes.root}>                
                <Typography variant="body1" color="textSecondary">
                    Manager 
                </Typography>
                {isOwner? "You are Meeting Owner":"You are not Meeting Owner"} <br/>

                
                <Link onClick={(e: any) => { startHMM() }}>
                    startManager
                </Link>

                <a onClick={()=>{sendStartRecord()}}>START_RECORD</a>
                <br/>
                <a onClick={()=>{sendStopRecord()}}>STOP_RECORD</a>
                <br/>

                <a onClick={()=>{sendStartShareTileView()}}>START_SHARE_TILE_VIEW</a>
                <br/>
                <a onClick={()=>{sendStopShareTileView()}}>STOP_SHARE_TILE_VIEW</a>
                <br/>

                

                <div>
                    <a onClick={()=>{ sendTerminate() }}>TERMINATE!</a>
                </div>
                
                <div>
                    {hmmstatus}
                </div>
                
                <div>
                    <br/>
                    <a onClick={()=>{updateHMMInfo()}}>get_manager_info</a>
                </div>


                <div>
                    <a onClick={()=>{updateMeetingInfo()}}>updateMeetingInfo</a>
                    <br/>
                    {ownerId}
                    <br />
                    {publicIp}
                </div>


            </div>

    );
}

 