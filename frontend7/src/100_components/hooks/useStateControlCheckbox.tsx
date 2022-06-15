import React, { ChangeEvent, useMemo, useRef } from "react";
import { useEffect } from "react";

export type StateControlCheckbox = {
    trigger: JSX.Element;
    updateState: (newVal: boolean) => void;
    className: string;
};

// 画面アクション用チェックボックス
// (1) 入力されたclassNameを持つエレメント(チェックボックスを想定)のon/offを同期
// (2) <入力されたclassName>-removerを持つエレメントがクリックされたときにclassNameのエレメントを全offに変更
// (3) 入力されたclassNameを持つエレメントの状態を変更するメソッド
// (4) 入力されたclassNameを持つチェックボックス. このチェックボックスに反応するエレメントの兄弟エレメントにすることで動作をトリガーする。
//    (4-1) classNameに反応させる。（例）open-sidebar-checkboxというclassNameの場合。
// .open-sidebar-checkbox {
//     display: none;
//     &:checked ~ .sidebar {
//         ...
//     }
//     & ~ .sidebar {
//         ...
//     }
// }
//    (4-2) 汎用className(state-control-checkbox)に反応させる。(例)
// .state-control-checkbox {
//     display: none;
//     &:checked ~ .dialog-container {
//         ...
//     }
//     & ~ .dialog-container {
//         ...
//     }
// }
//
// 備考１：基本的にはReactのレンダリングフェーズに入らず画面遷移できるので、
//       軽量化に役立つと考えているが、副作用があるかもしれず、まだ実験段階。
// 備考２：(4-2) のやり方に統一したほうが良い気がする。
// 備考３： rotate-buttonも汎用className。

export const useStateControlCheckbox = (className: string, changeCallback?: (newVal: boolean) => void): StateControlCheckbox => {
    const currentValForTriggerCallback = useRef<boolean>();
    // (4) トリガチェックボックス
    const callback = useMemo(() => {
        console.log("generate callback function", className);
        return (newVal: boolean) => {
            if (!changeCallback) {
                return;
            }
            //  値が同じときはスルー (== 初期値(undefined)か、値が違ったのみ発火)
            if (currentValForTriggerCallback.current === newVal) {
                return;
            }
            // 初期値(undefined)か、値が違ったのみ発火
            currentValForTriggerCallback.current = newVal;
            changeCallback(currentValForTriggerCallback.current);
        };
    }, []);
    const trigger = useMemo(() => {
        if (changeCallback) {
            return (
                <input
                    type="checkbox"
                    className={`${className} state-control-checkbox rotate-button`}
                    id={`${className}`}
                    onChange={(e) => {
                        callback(e.target.checked);
                    }}
                />
            );
        } else {
            return <input type="checkbox" className={`${className} state-control-checkbox rotate-button`} id={`${className}`} />;
        }
    }, []);

    useEffect(() => {
        const checkboxes = document.querySelectorAll(`.${className}`);
        // (1) On/Off同期
        checkboxes.forEach((x) => {
            // @ts-ignore
            x.onchange = (ev) => {
                updateState(ev.target.checked);
            };
        });
        // (2) 全エレメントoff
        const createMeetingDialogRemovers = document.querySelectorAll(`.${className}-remover`);
        createMeetingDialogRemovers.forEach((x) => {
            // @ts-ignore
            x.onclick = (ev) => {
                if (ev.target.className.indexOf(`${className}-remover`) > 0) {
                    updateState(false);
                }
            };
        });
    }, []);

    // (3) ステート変更
    const updateState = useMemo(() => {
        return (newVal: boolean) => {
            const currentCheckboxes = document.querySelectorAll(`.${className}`);
            currentCheckboxes.forEach((y) => {
                // @ts-ignore
                y.checked = newVal;
            });
            if (changeCallback) {
                callback(newVal);
            }
        };
    }, []);

    return { trigger, updateState, className };
};
