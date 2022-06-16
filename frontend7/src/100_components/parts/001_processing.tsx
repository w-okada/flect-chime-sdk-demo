import React, { useMemo } from "react";
export const Processing = () => {
    const processing = useMemo(() => {
        return (
            <div className="processing-container">
                <ul className="loading">
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        );
    }, []);
    return processing;
};
