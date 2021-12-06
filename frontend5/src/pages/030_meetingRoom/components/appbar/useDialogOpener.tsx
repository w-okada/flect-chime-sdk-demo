import { IconButton, Tooltip } from "@material-ui/core";
import { ExitToApp, Settings } from "@material-ui/icons";
import React, { useMemo } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";

const DialogType = {
    SettingDialog: "SettingDialog",
    LeaveDialog: "LeaveDialog",
} as const;
type DialogType = typeof DialogType[keyof typeof DialogType];

type DialogOpenerSetting = {
    icon: JSX.Element;
    tooltip: string;
};

const DialogOpenerSettings: { [key in DialogType]: DialogOpenerSetting } = {
    SettingDialog: {
        icon: <Settings />,
        tooltip: "Setting",
    },
    LeaveDialog: {
        icon: <ExitToApp />,
        tooltip: "Exit",
    },
};

export const useDialogOpener = () => {
    const { frontendState } = useAppState();

    const generateButton = (setting: DialogOpenerSetting, clicked: (val: boolean) => void) => {
        return (
            <Tooltip title={setting.tooltip}>
                <IconButton
                    color="inherit"
                    style={{ height: ToolbarHeight, width: ToolbarHeight }}
                    onClick={() => {
                        clicked(true);
                    }}
                >
                    {setting.icon}
                </IconButton>
            </Tooltip>
        );
    };
    const settingButton = useMemo(() => {
        return generateButton(DialogOpenerSettings.SettingDialog, frontendState.setSettingDialogOpen);
    }, []);
    const leaveButton = useMemo(() => {
        return generateButton(DialogOpenerSettings.LeaveDialog, frontendState.setLeaveDialogOpen);
    }, []);
    return { settingButton, leaveButton };
};
