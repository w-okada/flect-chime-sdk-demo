import { AppBar, Toolbar, Typography } from "@material-ui/core";
import React, { useMemo, useState } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";
import { useStyles } from "../../css";
import { useDeviceEnabler } from "./useDeviceEnabler";
import { useDialogOpener } from "./useDialogOpener";
import { useFeatureEnabler } from "./useFeatureEnabler";
import { useScrenTypeSwitch } from "./useScreenTypeSwitch";

export const useAppbar = () => {
    const classes = useStyles();

    const { microphoneButton, cameraButton, speakerButton } = useDeviceEnabler();
    const { screenShareButton, sideBarButton, attendeesViewButton, transcribeButton } = useFeatureEnabler();
    const { featureViewButton, gridViewButton } = useScrenTypeSwitch();
    const { settingButton, leaveButton } = useDialogOpener();
    const [sec, setSec] = useState(0);
    const { windowSize, frontendState, chimeClientState } = useAppState();
    const appBar = useMemo(() => {
        return (
            <AppBar style={{ height: ToolbarHeight }}>
                <Toolbar style={{ height: ToolbarHeight, display: "flex", justifyContent: "space-between" }}>
                    <div className={classes.toolbarInnnerBox}>{/* <DrawerOpener open={drawerOpen} setOpen={setDrawerOpen} /> */}</div>
                    <div className={classes.toolbarInnnerBox}>
                        <Typography color="inherit" noWrap className={classes.title}>
                            {`${chimeClientState.userName || ""}@${chimeClientState.meetingName || ""}`}
                        </Typography>
                    </div>
                    <div className={classes.toolbarInnnerBox}>
                        <div className={classes.toolbarInnnerBox}>
                            {microphoneButton}
                            {cameraButton}
                            {speakerButton}
                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {sideBarButton}
                            {attendeesViewButton}
                            {screenShareButton}
                            {transcribeButton}
                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {featureViewButton}
                            {gridViewButton}
                            <span style={{ height: ToolbarHeight, width: ToolbarHeight }}> </span>
                            {settingButton}
                            {leaveButton}
                        </div>
                        <div className={classes.toolbarInnnerBox}></div>
                    </div>
                </Toolbar>
            </AppBar>
        );
    }, [microphoneButton, cameraButton, speakerButton, screenShareButton, transcribeButton, sideBarButton, attendeesViewButton, featureViewButton, gridViewButton, settingButton, leaveButton]);

    return { appBar };
};
