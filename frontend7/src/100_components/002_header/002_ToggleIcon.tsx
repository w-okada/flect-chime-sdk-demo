import React, { useMemo } from "react";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export type ToggleIconProps = {
    id: string;
    onIconProp: IconProp;
    offIconProp: IconProp;
    currentState: boolean;
    tooltip?: string;

    onChangeToOn: () => void;
    onChangeToOff: () => void;
};

export const ToggleIcon = (props: ToggleIconProps) => {
    const onChange = () => {
        if (props.currentState) {
            props.onChangeToOff();
        } else {
            props.onChangeToOn();
        }
    };
    useEffect(() => {
        const icon = document.getElementById(props.id) as HTMLInputElement;
        icon.checked = props.currentState;
    }, [props.currentState]);

    const icon = useMemo(() => {
        return (
            <div className="tooltip tooltip-bottom" data-tip={props.tooltip ? props.tooltip : ""}>
                <label className="swap swap-rotate" style={{ height: "100%" }}>
                    <input type="checkbox" id={props.id} onChange={onChange} />
                    <FontAwesomeIcon className="swap-on " icon={props.onIconProp} size="1x" fixedWidth style={{ background: "#ffff00", border: "2px solid" }} />
                    <FontAwesomeIcon className="swap-off " icon={props.offIconProp} size="1x" fixedWidth style={{ background: "#ffffff", border: "2px solid" }} />
                </label>
            </div>
        );
    }, [props.currentState]);
    return icon;
};
