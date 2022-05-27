import React, { useMemo } from "react";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import "../../App.css";
export type SelectableIconProps = {
    id: string;
    icons: {
        onIconProp: IconProp;
        offIconProp: IconProp;
        status: string;
        tooltip?: string;
    }[];
    currentState: string;
    onChange: (status: string) => void;
};

export const SelectableIcon = (props: SelectableIconProps) => {
    const onChange = (status: string) => {
        props.onChange(status);
    };

    const createIcon = (groupId: string, status: string, onIconProp: IconProp, offIconProp: IconProp, tooltip?: string) => {
        const iconId = `${groupId}-${status}`;
        console.log("check", props.currentState, status);
        const icon = props.currentState === status ? <FontAwesomeIcon className="swap-on header-item-selectable-icon-active" icon={onIconProp} size="1x" /> : <FontAwesomeIcon className="swap-off header-item-selectable-icon" icon={offIconProp} size="1x" />;
        return (
            <div key={iconId} className="tooltip tooltip-bottom" data-tip={tooltip ? tooltip : ""}>
                <input
                    type="radio"
                    id={iconId}
                    name={groupId}
                    onChange={() => {
                        onChange(status);
                    }}
                    hidden
                />
                <label htmlFor={iconId}>{icon}</label>
            </div>
        );
    };
    const icons = useMemo(() => {
        return props.icons.map((x) => {
            return createIcon(props.id, x.status, x.onIconProp, x.offIconProp, x.tooltip);
        });
    }, [props.currentState]);

    useEffect(() => {
        const icon = document.getElementById(props.id) as HTMLInputElement;
        // icon.checked = props.currentState;
    }, [props.currentState]);

    return <>{icons}</>;
};
