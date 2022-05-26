import { useMemo, useState } from "react";

export const ScreenType = {
    FeatureView: "FeatureView",
    GridView: "GridView",
} as const;
export type ScreenType = typeof ScreenType[keyof typeof ScreenType];

export type FrontendState = {
    screenType: ScreenType;
    setScreenType: (v: ScreenType) => void;
    sideBarOpen: boolean;
    setSideBarOpen: (v: boolean) => void;
    attendeesViewOpen: boolean;
    setAttendeesViewOpen: (v: boolean) => void;

    settingDialogOpen: boolean;
    setSettingDialogOpen: (v: boolean) => void;
    leaveDialogOpen: boolean;
    setLeaveDialogOpen: (v: boolean) => void;
};

export const useFrontend = () => {
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.FeatureView);
    const [settingDialogOpen, setSettingDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [sideBarOpen, setSideBarOpen] = useState(false);
    const [attendeesViewOpen, setAttendeesViewOpen] = useState(false);

    const returnValue: FrontendState = {
        screenType,
        setScreenType,
        sideBarOpen,
        setSideBarOpen,
        attendeesViewOpen,
        setAttendeesViewOpen,

        settingDialogOpen,
        setSettingDialogOpen,
        leaveDialogOpen,
        setLeaveDialogOpen,
    };
    return returnValue;
};
