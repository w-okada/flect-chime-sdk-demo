import { ReactNode, useContext, useState } from "react";
import React from "react";

type Props = {
    children: ReactNode;
};

export type FrontEffect = "None" | "Ascii" | "Canny" | "Black"
export type BackgroundEffect = "None" | "Ascii" | "Canny" | "Black" | "Image" | "Window"

const FrontEffectOoptions:FrontEffect[] = ["None", "Ascii", "Canny", "Black"]
const BackgroundEffectOoptions:BackgroundEffect[] = ["None", "Ascii", "Canny", "Black", "Image", "Window"]



interface VideoEffectStateValue {
    frontEffect:FrontEffect,
    backgroundEffect:BackgroundEffect
    backgroundImage: HTMLImageElement | null
    backgroundMediaStream: MediaStream | null
    frontEffectOptions : FrontEffect[]
    backgroundEffectOptions : BackgroundEffect[] 
    setFrontEffect:(e:FrontEffect)            => void
    setBackgroundEffect:(e:BackgroundEffect)  => void
    setBackgroundImage: (p:HTMLImageElement|null)        => void
    setBackgroundMediaStream: (m:MediaStream|null) => void
}


export const VideoEffectStateContext = React.createContext<VideoEffectStateValue | null>(null)

export const useVideoEffectState = (): VideoEffectStateValue => {
  const state = useContext(VideoEffectStateContext)
  if (!state) {
    throw new Error("Error using video effect in context!")
  }
  return state
}

export const VideoEffectStateProvider = ({ children }: Props) => {
    const [frontEffect, setFrontEffect] = useState("None" as FrontEffect)
    const [backgroundEffect, setBackgroundEffect] = useState("None" as BackgroundEffect)
    const [backgroundImage, setBackgroundImage] = useState(null as HTMLImageElement|null)
    const [backgroundMediaStream, setBackgroundMediaStream] = useState(null as MediaStream|null)
    const frontEffectOptions = FrontEffectOoptions
    const backgroundEffectOptions = BackgroundEffectOoptions
    
    const providerValue = {
        frontEffect,
        backgroundEffect,
        backgroundImage,
        backgroundMediaStream,

        frontEffectOptions,
        backgroundEffectOptions,

        setFrontEffect,
        setBackgroundEffect,
        setBackgroundImage,
        setBackgroundMediaStream
    }

    return (
      <VideoEffectStateContext.Provider value={providerValue}>
        {children}
      </VideoEffectStateContext.Provider>
    )
}

