import { useEffect, useState } from "react";


const getWidth = () =>document.documentElement.clientWidth || document.body.clientWidth;
const getHeight = () => document.documentElement.clientHeight || document.body.clientHeight;

export const useWindowSizeChangeListener = () =>{
    const [screenWidth, setScreenWidth] = useState(getWidth())
    const [screenHeight, setScreenHeight ] = useState(getHeight())

    useEffect(()=>{
        const resizeListener = () => {
            setScreenWidth(getWidth())
            setScreenHeight(getHeight())
        };

        window.addEventListener('resize', resizeListener)
        return () => {
            window.removeEventListener('resize', resizeListener)
        }
    },[])
    return {screenWidth, screenHeight}
}
