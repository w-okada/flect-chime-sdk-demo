import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { CssBaseline, AppBar, Drawer, Toolbar } from "@material-ui/core";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { DrawerOpener } from "./components0/appbars/DrawerOpener";
import { Title } from "./components0/appbars/Title";
import { useAppState } from "../../providers/AppStateProvider";
import { useStyles } from "./css";
import { DeviceEnabler } from "./components0/appbars/DeviceEnabler";
import { DialogOpener } from "./components0/appbars/DialogOpener";
import { FeatureEnabler } from "./components0/appbars/FeatureEnabler";
import { ScreenType, SwitchButtons } from "./components0/appbars/SwitchButtons";
import { LeaveMeetingDialog } from "./components/dialog/LeaveMeetingDialog";
import { CustomAccordion } from "./components0/sidebars/CustomAccordion";
import { AttendeesTable } from "./components0/sidebars/AttendeesTable";
import { ChatArea } from "./components0/sidebars/ChatArea";
import { WhiteboardPanel } from "./components0/sidebars/WhiteboardPanel";
import { CreditPanel } from "./components0/sidebars/CreditPanel";
import { FullScreenView } from "./components0/ScreenView/FullScreenView";
import { FeatureView } from "./components0/ScreenView/FeatureView";
import { GridView } from "./components0/ScreenView/GridView";
import { OnetimeCodePanel } from "./components0/sidebars/OnetimeCodePanel";
import { ManagerControllerPanel } from "./components0/sidebars/ManagerControllerPanel";
import { RecorderPanel } from "./components0/sidebars/RecorderPanel";
import { TranscriptionPanel } from "./components0/sidebars/TranscriptionPanel";
import { useAppbar } from "./components/appbar/useAppbar";
import { useMainView } from "./components/mainview/useMainView";
import { ToolbarHeight } from "../../constants";
import { SettingDialog } from "./components/dialog/SettingDialog";
import { useSidebar } from "./components/sidebar/useSidebar";
import { useAttendeesView } from "./components/AttendeesView/useAttendeesView";

const BufferHeight = 20;
const theme = createTheme({
    mixins: {
        toolbar: {
            minHeight: ToolbarHeight,
        },
    },
});

export const MeetingRoom = () => {
    const classes = useStyles();
    const { windowSize, chimeClientState } = useAppState();
    const { appBar } = useAppbar();
    const { mainView } = useMainView();
    const { sideBar } = useSidebar();
    const { attendeeLine } = useAttendeesView();

    useEffect(() => {
        const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement;
        audioElement.autoplay = false;
        chimeClientState.setOutputAudioElement(audioElement);
    }, []); // eslint-disable-line

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    overflowX: "hidden",
                    overflowY: "hidden",
                }}
            >
                <SettingDialog />
                <LeaveMeetingDialog />
                {appBar}
                {/* <Drawer
                        variant="permanent"
                        classes={{
                            paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
                        }}
                        open={drawerOpen}
                    >
                        <CustomAccordion title="Member">
                            <AttendeesTable />
                        </CustomAccordion>

                        <CustomAccordion title="Chat">
                            <ChatArea />
                        </CustomAccordion>

                        <CustomAccordion title="Whiteboard">
                            <WhiteboardPanel />
                        </CustomAccordion>

                        <CustomAccordion title="About">
                            <CreditPanel />
                        </CustomAccordion>

                        <CustomAccordion title="OnetimeCode (exp.)">
                            <OnetimeCodePanel />
                        </CustomAccordion>

                        <CustomAccordion title="StartManagerPanel (exp.)">
                            <ManagerControllerPanel />
                        </CustomAccordion>

                        <CustomAccordion title="RecordMeeting (exp.)">
                            <RecorderPanel />
                        </CustomAccordion>

                        <CustomAccordion title="Transcription">
                            <TranscriptionPanel />
                        </CustomAccordion>
                    </Drawer> */}
                <div
                    style={{
                        marginTop: ToolbarHeight,
                        position: "absolute",
                        display: "flex",
                        width: "100%",
                        height: `${windowSize.windowHeight - ToolbarHeight - BufferHeight}px`,
                    }}
                >
                    {mainView}
                    <div style={{ position: "absolute", top: "5%", left: "2%", width: "10%", height: "90%" }}>{sideBar}</div>
                    <div style={{ position: "absolute", top: "85%", left: "20%", width: "60%", height: "10%" }}>{attendeeLine}</div>
                </div>
            </div>

            {/* ************************************** */}
            {/* *****   Hidden Elements          ***** */}
            {/* ************************************** */}
            <div>
                <audio id="for-speaker" style={{ display: "none" }} />
            </div>
        </ThemeProvider>
    );
};
