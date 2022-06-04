import { useMemo, useState } from "react";

export const ScreenType = {
    FeatureView: "FeatureView",
    GridView: "GridView",
} as const;
export type ScreenType = typeof ScreenType[keyof typeof ScreenType];

export type FrontendState = {
    // (1) User Information
    username: string
    setUserName: (name: string) => void
    // // (2) GUI Control
    // screenType: ScreenType;
    // setScreenType: (v: ScreenType) => void;
    // sideBarOpen: boolean;
    // setSideBarOpen: (v: boolean) => void;
    // attendeesViewOpen: boolean;
    // setAttendeesViewOpen: (v: boolean) => void;

    // settingDialogOpen: boolean;
    // setSettingDialogOpen: (v: boolean) => void;
    // leaveDialogOpen: boolean;
    // setLeaveDialogOpen: (v: boolean) => void;
};

export const useFrontend = () => {
    // (1) User Information
    const [username, setUserName] = useState<string>("")

    // // (2) GUI Control
    // const [screenType, setScreenType] = useState<ScreenType>(ScreenType.FeatureView);
    // const [settingDialogOpen, setSettingDialogOpen] = useState(false);
    // const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    // const [sideBarOpen, setSideBarOpen] = useState(false);
    // const [attendeesViewOpen, setAttendeesViewOpen] = useState(false);

    const returnValue: FrontendState = {
        // (1) User Information
        username,
        setUserName,

        // // (2) GUI Control
        // screenType,
        // setScreenType,
        // sideBarOpen,
        // setSideBarOpen,
        // attendeesViewOpen,
        // setAttendeesViewOpen,

        // settingDialogOpen,
        // setSettingDialogOpen,
        // leaveDialogOpen,
        // setLeaveDialogOpen,
    };
    return returnValue;
};
