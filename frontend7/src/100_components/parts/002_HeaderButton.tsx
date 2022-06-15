import { IconName, IconPrefix } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { StateControlCheckbox } from "../hooks/useStateControlCheckbox";
import "./002_HeaderButton.css";

export const AnimationTypes = {
    colored: "colored",
    spinner: "spinner",
} as const;
export type AnimationTypes = typeof AnimationTypes[keyof typeof AnimationTypes];

export type HeaderButtonProps = {
    stateControlCheckbox: StateControlCheckbox;
    tooltip: string;
    onIcon: [IconPrefix, IconName];
    offIcon: [IconPrefix, IconName];
    animation: AnimationTypes;
    tooltipClass?: string;
};

export const HeaderButton = (props: HeaderButtonProps) => {
    const tooltipClass = props.tooltipClass || "tooltip-bottom";
    const headerButton = (
        <div className={`rotate-button-container ${tooltipClass}`} data-tooltip={props.tooltip}>
            {props.stateControlCheckbox.trigger}
            <label htmlFor={props.stateControlCheckbox.className} className="rotate-lable">
                <div className={props.animation}>
                    <FontAwesomeIcon icon={props.onIcon} className="spin-on" />
                    <FontAwesomeIcon icon={props.offIcon} className="spin-off" />
                </div>
            </label>
        </div>
    );
    return headerButton;
};
