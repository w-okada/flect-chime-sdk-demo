import React from "react";
import "../../App.css";
export type DialogProps = {
    title: string;
    children: JSX.Element[];
};
export const Dialog = (props: DialogProps) => {
    return (
        <div className="dialog-container">
            <div className="dialog-frame">
                <div className="dialog-title">{props.title}</div>
                <div className="dialog-content"> {props.children}</div>
            </div>
        </div>
    );
};
