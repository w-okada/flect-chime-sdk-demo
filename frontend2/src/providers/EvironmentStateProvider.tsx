import React, { useState, ReactNode, useContext, useEffect } from 'react';

type Props = {
    children: ReactNode;
};


interface EnvironmentStateValue {
    screenWidth:number
    screenHeight:number
}

const EnvironmentStateContext = React.createContext<EnvironmentStateValue | null>(null)


export const useEnvironmentState = (): EnvironmentStateValue => {
    const state = useContext(EnvironmentStateContext)
    if (!state) {
        throw new Error("Error using message state context!")
    }
    return state
}


// const getWidth = () => window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
const getWidth = () =>document.documentElement.clientWidth || document.body.clientWidth;

// const getHeight = () => window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
const getHeight = () => document.documentElement.clientHeight || document.body.clientHeight;
  

export const EnvironmentStateProvider = ({ children }: Props) => {
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



    const providerValue: EnvironmentStateValue = {
        screenWidth,
        screenHeight
    }

    return (
        <EnvironmentStateContext.Provider value={providerValue}>
            {children}
        </EnvironmentStateContext.Provider>
    )
}