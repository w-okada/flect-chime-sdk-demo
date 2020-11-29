import { FormField, Select, Checkbox } from "amazon-chime-sdk-component-library-react";
import { useVideoEffectState } from "../../providers/VideoEffectProvider/VideoEffectProvider";
import React from "react";
import { BackgroundImageSetting } from "./BackgroundImageSetting";
import { AsciiSetting } from "./AsciiSetting";
import { CannySetting } from "./CannySetting";
import { BlurSetting } from "./BlurSetting";
import { ColorSetting } from "./ColorSetting";
import { BackgroundWindowSetting } from "./BackgroundWindowSetting";

export const BackgroundEffectSelect: React.FC<{}> = props => {
    const { BackgroundEffectOptions, setBackgroundEffect, backgroundEffect, setBackgroundImage, setBackgroundMediaStream,
        syncBackground, setSyncBackground,
        asciiArtFontSizeForB, setAsciiArtFontSizeForB,
        cannyThreshold1ForB, cannyThreshold2ForB, cannyBitwiseNotForB, setCannyThreshold1ForB, setCannyThreshold2ForB, setCannyBitwiseNotForB,
        bularKernelSizeForB, setBularKernelSizeForB,
        colorColorForB, setColorColorForB,
        counter, setCounter } = useVideoEffectState()

    const options = BackgroundEffectOptions.map(e => { return { label: e, value: e } })
    const handleBackendEffectChange = (e: any) => {
        setBackgroundEffect(e.target.value)
        // if (selectDevice) {
        //     selectDevice(selectedDevice!)
        // }
    }

    // const handleVirtualBackgroundImageButtonClicked = (e: any) => {
    //   const input = document.createElement("input")
    //   input.type = "file"
    //   input.onchange = (file: any) => {
    //     console.log(file.target.files[0])
    //     const fileType = file.target.files[0].type
    //     if (fileType.startsWith("image")) {
    //       const path = URL.createObjectURL(file.target.files[0]);
    //       const img = document.createElement("img")
    //       img.src = path
    //       img.onload = () => {
    //         setBackgroundImage(img)
    //         if (selectDevice) {
    //           selectDevice(selectedDevice!)
    //         }

    //       }
    //     }
    //   }
    //   input.click()
    // }



    return (
        <>
            <FormField
                field={Select}
                options={options}
                onChange={handleBackendEffectChange}
                value={backgroundEffect}
                label="Select Background Effect"
                layout={'horizontal'}
            />
            sync(experimental)
            <Checkbox value="" checked={syncBackground}
              onChange={(e) => { 
                setSyncBackground(!syncBackground)
                setCounter(counter+1)
              }}
              aria-label="checkbox label"
            />

            <div style={{ paddingLeft: 15 }} hidden={!(backgroundEffect === "Ascii")}>
                <AsciiSetting fontSize={asciiArtFontSizeForB} setFontSize={(fontSize: number) => {
                    setAsciiArtFontSizeForB(fontSize)
                    setCounter(counter + 1)
                }} />
            </div>
            
            <div style={{ paddingLeft: 15 }} hidden={!(backgroundEffect === "Canny")}>
                <CannySetting 
                    threshold1={cannyThreshold1ForB} threshold2={cannyThreshold2ForB} bitwiseNot={cannyBitwiseNotForB}
                    setThreshold1={(e)=>{setCannyThreshold1ForB(e);setCounter(counter + 1)} }
                    setThreshold2={(e)=>{setCannyThreshold2ForB(e);setCounter(counter + 1)} }
                    setBitwiseNot={(e)=>{setCannyBitwiseNotForB(e);setCounter(counter + 1)} }
                 />
            </div>
            <div style={{ paddingLeft: 15 }} hidden={!(backgroundEffect === "Blur")}>
                <BlurSetting kernelSize={bularKernelSizeForB} 
                    setKernelSize={(w,h)=>{setBularKernelSizeForB(w,h);setCounter(counter + 1)}}
                />
            </div>
            <div style={{ paddingLeft: 15 }} hidden={!(backgroundEffect === "Color")}>
                <ColorSetting color={colorColorForB} 
                    setColor={(e)=>{setColorColorForB(e);setCounter(counter + 1)}}
                />
            </div>


            <div hidden={!(backgroundEffect === "Image")}>
                <BackgroundImageSetting setBackgroundImage={(img: HTMLImageElement) => {
                    setBackgroundImage(img)
                }} />
            </div>

            <div hidden={!(backgroundEffect === "Window")}>
                <BackgroundWindowSetting setBackgroundWindow={(stream)=>{
                    setBackgroundMediaStream(stream)
                }}/>
            </div>
        </>
    );
};
