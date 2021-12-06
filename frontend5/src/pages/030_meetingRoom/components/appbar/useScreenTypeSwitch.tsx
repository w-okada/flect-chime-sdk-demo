import { IconButton, Tooltip } from "@material-ui/core";
import { ViewComfy, ViewCompact } from "@material-ui/icons";
import React, { useMemo } from "react";
import { ToolbarHeight } from "../../../../constants";
import { useAppState } from "../../../../providers/AppStateProvider";
import { ScreenType } from "../../../../providers/hooks/useFrontend";

type ScreenTypeSwitchSetting = {
    screenType: ScreenType;
    icon: JSX.Element;
    tooltip: string;
};
const ScreenTypeSwitchSettings: { [key in ScreenType]: ScreenTypeSwitchSetting } = {
    FeatureView: {
        screenType: ScreenType.FeatureView,
        icon: <ViewCompact />,
        tooltip: "Feature View",
    },
    GridView: {
        screenType: ScreenType.GridView,
        icon: <ViewComfy />,
        tooltip: "Grid View",
    },
};

export const useScrenTypeSwitch = () => {
    const { frontendState } = useAppState();

    const generateButton = (setting: ScreenTypeSwitchSetting, setEnable: (val: ScreenType) => void) => {
        return (
            <Tooltip title={setting.tooltip}>
                <IconButton
                    color="inherit"
                    style={{ height: ToolbarHeight, width: ToolbarHeight, color: setting.screenType === frontendState.screenType ? "#ee7777" : "#ffffff" }}
                    onClick={() => {
                        setEnable(setting.screenType);
                    }}
                >
                    {setting.icon}
                </IconButton>
            </Tooltip>
        );
    };

    const featureViewButton = useMemo(() => {
        return generateButton(ScreenTypeSwitchSettings.FeatureView, frontendState.setScreenType);
    }, [frontendState.screenType]);
    const gridViewButton = useMemo(() => {
        return generateButton(ScreenTypeSwitchSettings.GridView, frontendState.setScreenType);
    }, [frontendState.screenType]);

    return { featureViewButton, gridViewButton };
};
