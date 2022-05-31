import React from "react";
import { useEffect } from "react";

export type StateControlCheckbox = {
    trigger: JSX.Element;
    updateState: (newVal: boolean) => void;
};

export const useStateControlCheckbox = (className: string): StateControlCheckbox => {
    const trigger = <input type="checkbox" className={`${className} rotate-button`} id={`${className}`} />;

    useEffect(() => {
        const checkboxes = document.querySelectorAll(`.${className}`);
        checkboxes.forEach((x) => {
            // @ts-ignore
            x.onchange = (ev) => {
                updateState(ev.target.checked);
            };
        });

        const createMeetingDialogRemovers = document.querySelectorAll(`.${className}-remover`);
        createMeetingDialogRemovers.forEach((x) => {
            // @ts-ignore
            x.onclick = () => {
                updateState(false);
            };
        });
    }, []);

    const updateState = (newVal: boolean) => {
        const currentCheckboxes = document.querySelectorAll(`.${className}`);
        currentCheckboxes.forEach((y) => {
            // @ts-ignore
            y.checked = newVal;
        });
    };

    return { trigger, updateState };
};
