import React from "react";
import { TriggerIcon, TriggerIconProps } from "./001_TriggerIcon";
import { ToggleIcon, ToggleIconProps } from "./002_ToggleIcon";
import { SelectableIcon, SelectableIconProps } from "./003_SelectableIcon";

//@ts-ignore
import logo from "../../../public/images/flect.png";
export const Header = () => {
    const settingIconProps: TriggerIconProps = {
        id: "header-setting-dialog-icon",
        iconProp: ["fas", "gear"],
        tooltip: "setting",
        onClick: function (): void {
            console.log("trriger config");
        },
    };
    const leaveIconProps: TriggerIconProps = {
        id: "header-leave-dialog-icon",
        iconProp: ["fas", "right-from-bracket"],
        tooltip: "leave meeting",
        onClick: () => {
            console.log("trriger config");
        },
    };

    const micToggleIconProps: ToggleIconProps = {
        id: "header-mic-toggle-icon",
        currentState: false,
        tooltip: "toggle mic",
        onIconProp: ["fas", "microphone"],
        offIconProp: ["fas", "microphone-slash"],
        onChangeToOn: () => {
            console.log("toggle to on");
        },
        onChangeToOff: () => {
            console.log("toggle to off");
        },
    };
    const cameraToggleIconProps: ToggleIconProps = {
        id: "header-camera-toggle-icon",
        currentState: false,
        tooltip: "toggle camera",
        onIconProp: ["fas", "video"],
        offIconProp: ["fas", "video-slash"],
        onChangeToOn: () => {
            console.log("toggle to on");
        },
        onChangeToOff: () => {
            console.log("toggle to off");
        },
    };
    const speakerToggleIconProps: ToggleIconProps = {
        id: "header-speaker-toggle-icon",
        currentState: false,
        tooltip: "toggle speaker",
        onIconProp: ["fas", "volume-high"],
        offIconProp: ["fas", "volume-xmark"],
        onChangeToOn: () => {
            console.log("toggle to on");
        },
        onChangeToOff: () => {
            console.log("toggle to off");
        },
    };

    const screenTypeSelectProps: SelectableIconProps = {
        id: "header-screen-type-select-icon",
        icons: [
            {
                onIconProp: ["far", "square"],
                offIconProp: ["far", "square"],
                status: "FEATURE_VIEW",
                tooltip: "Feature View",
            },
            {
                onIconProp: ["fas", "border-all"],
                offIconProp: ["fas", "border-all"],
                status: "GRID_VIEW",
                tooltip: "Grid View",
            },
        ],
        currentState: "FEATURE_VIEW",
        onChange: function (status: string): void {
            console.log("Function not implemented.", status);
        },
    };

    return (
        <div className="header-container">
            <div className="header-container-left">
                <div className="header-item-container">
                    <img src={logo} className="header-item" />
                </div>
                <div className="header-item-container">
                    <div className="header-item-application-title">Flect Amazon Chime Demo</div>
                </div>
            </div>
            <div className="header-container-center">TITLE:STATES(TOBE)</div>
            <div className="header-container-right">
                <div className="header-item-container">
                    <ToggleIcon {...micToggleIconProps}></ToggleIcon>
                </div>
                <div className="header-item-container">
                    <ToggleIcon {...cameraToggleIconProps}></ToggleIcon>
                </div>
                <div className="header-item-container">
                    <ToggleIcon {...speakerToggleIconProps}></ToggleIcon>
                </div>

                <div className="header-item-container">
                    <SelectableIcon {...screenTypeSelectProps}></SelectableIcon>
                </div>

                <div className="header-item-container">
                    <TriggerIcon {...settingIconProps}></TriggerIcon>
                </div>
                <div className="header-item-container">
                    <TriggerIcon {...leaveIconProps}></TriggerIcon>
                </div>
            </div>
        </div>
    );
};
