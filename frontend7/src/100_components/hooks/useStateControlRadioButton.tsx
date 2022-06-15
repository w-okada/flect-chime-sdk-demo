import React from "react";
import { StateControlCheckbox } from "./useStateControlCheckbox";

export type StateControlRadioButton = StateControlCheckbox;
export type StateControlRadioButtons = { [key: string]: StateControlRadioButton };

// 画面アクション用ラジオボタン
export const useStateControlRadioButton = (baseClassName: string, classSuffixes: string[], callback: (suffix: string) => void): StateControlRadioButtons => {
    // const buttons: { [key: string]: JSX.Element } = {};
    // classSuffixes.forEach((x) => {
    //     const elem = (
    //         <input
    //             type="radio"
    //             name={baseClassName}
    //             className={`${baseClassName}-${x} state-control-checkbox rotate-button`}
    //             id={`${baseClassName}-${x}`}
    //             onChange={() => {
    //                 callback(x);
    //             }}
    //         />
    //     );
    //     buttons[x] = elem;
    // });

    // const selectButton = (suffix: string) => {
    //     const b = document.getElementById(`${baseClassName}-${suffix}`) as HTMLInputElement;
    //     b.checked = true;
    // };

    const buttons: StateControlRadioButtons = {};
    classSuffixes.forEach((x) => {
        const className = `${baseClassName}-${x}`;
        const elem = (
            <input
                type="radio"
                name={baseClassName}
                className={`${className} state-control-checkbox rotate-button`}
                id={`${className}`}
                onChange={() => {
                    callback(x);
                }}
            />
        );
        const updateState = (newVal: boolean) => {
            const b = document.getElementById(className) as HTMLInputElement;
            b.checked = newVal;
        };
        const button: StateControlRadioButton = {
            trigger: elem,
            updateState: updateState,
            className: className,
        };
        buttons[x] = button;
    });

    return buttons;
};
