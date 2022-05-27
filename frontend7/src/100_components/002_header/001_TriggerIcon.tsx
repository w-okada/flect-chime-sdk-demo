import React from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
export type TriggerIconProps = {
    id: string;
    iconProp: IconProp;
    tooltip?: string;
    onClick: () => void;
};

export const TriggerIcon = (props: TriggerIconProps) => {
    const onClick = () => {
        props.onClick();
    };
    const icon = useMemo(() => {
        return (
            <div className="tooltip tooltip-bottom" data-tip={props.tooltip ? props.tooltip : ""}>
                <label className="swap swap-rotate">
                    <input type="checkbox" id={props.id} onClick={onClick} />
                    <FontAwesomeIcon className="swap-on " icon={props.iconProp} size="1x" />
                    <FontAwesomeIcon className="swap-off " icon={props.iconProp} size="1x" />
                </label>
            </div>
        );
    }, []);

    return icon;
};
