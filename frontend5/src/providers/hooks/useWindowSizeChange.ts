import { useEffect, useState } from "react";

const getWidth = () => document.documentElement.clientWidth || document.body.clientWidth;
const getHeight = () => document.documentElement.clientHeight || document.body.clientHeight;

export type WindowSize = {
    windowWidth: number;
    windowHeight: number;
};

export const useWindowSizeChangeListener = () => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        windowWidth: getWidth(),
        windowHeight: getHeight(),
    });
    useEffect(() => {
        const resizeListener = () => {
            setWindowSize({
                windowWidth: getWidth(),
                windowHeight: getHeight(),
            });
        };

        window.addEventListener("resize", resizeListener);
        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, []);
    return { windowSize };
};
