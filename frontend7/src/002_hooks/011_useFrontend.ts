import { useMemo, useState } from "react";

export const ViewType = {
    feature: "feature",
    grid: "grid",
} as const;
export type ViewType = typeof ViewType[keyof typeof ViewType];

export type FrontendState = {
    // (1) User Information
    username: string
    setUserName: (name: string) => void
    viewType: ViewType
    setViewType: (val: ViewType) => void
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
    const [viewType, setViewType] = useState<ViewType>(ViewType.feature)

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
        viewType,
        setViewType
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
