import React from "react";

// 画面アクション用ラジオボタン

export const useStateControlRadioButton = (baseClassName: string, classSuffixes: string[], callback: (suffix: string) => void) => {
    // (4) トリガチェックボックス
    const buttons: { [key: string]: JSX.Element } = {};
    classSuffixes.forEach((x) => {
        const elem = (
            <input
                type="radio"
                name={baseClassName}
                className={`${baseClassName}-${x} state-control-checkbox rotate-button`}
                id={`${baseClassName}-${x}`}
                onChange={() => {
                    callback(x);
                }}
            />
        );
        buttons[x] = elem;
    });

    const selectButton = (suffix: string) => {
        const b = document.getElementById(`${baseClassName}-${suffix}`) as HTMLInputElement;
        b.checked = true;
    };

    return {
        buttons,
        selectButton,
    };
};
