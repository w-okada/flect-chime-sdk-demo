import { AppBar, Toolbar } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";
import { DeviceEnabler } from "../../components0/appbars/DeviceEnabler";
import { DialogOpener } from "../../components0/appbars/DialogOpener";
import { DrawerOpener } from "../../components0/appbars/DrawerOpener";
import { FeatureEnabler } from "../../components0/appbars/FeatureEnabler";
import { SwitchButtons } from "../../components0/appbars/SwitchButtons";
import { Title } from "../../components0/appbars/Title";
import { useStyles } from "../../css";
import { useDeviceEnabler } from "./useDeviceEnabler";
import { useDialogOpener } from "./useDialogOpener";
import { useFeatureEnabler } from "./useFeatureEnabler";
import { useScrenTypeSwitch } from "./useScreenTypeSwitch";

export const useAppbar = () => {
    const classes = useStyles();

    const { microphoneButton, cameraButton, speakerButton } = useDeviceEnabler();
    const { screenShareButton, sideBarButton, attendeesViewButton } = useFeatureEnabler();
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
                        <Title title={`${chimeClientState.userName || ""}@${chimeClientState.meetingName || ""}`} />
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
    }, [microphoneButton, cameraButton, speakerButton, screenShareButton, sideBarButton, attendeesViewButton, featureViewButton, gridViewButton, settingButton, leaveButton]);

    return { appBar };
};
