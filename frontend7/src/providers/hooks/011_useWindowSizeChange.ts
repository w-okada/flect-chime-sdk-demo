import { useEffect, useState } from "react";

const getWidth = () => document.documentElement.clientWidth || document.body.clientWidth;
const getHeight = () => document.documentElement.clientHeight || document.body.clientHeight;

export type WindowSizeState = {
    windowWidth: number;
    windowHeight: number;
};

export const useWindowSizeChangeListener = (): WindowSizeState => {
    const [windowSizeState, setWindowSizeState] = useState<WindowSizeState>({
        windowWidth: getWidth(),
        windowHeight: getHeight(),
    });
    useEffect(() => {
        const resizeListener = () => {
            setWindowSizeState({
                windowWidth: getWidth(),
                windowHeight: getHeight(),
            });
        };

        window.addEventListener("resize", resizeListener);
        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, []);
    return {
        ...windowSizeState
    };
};
