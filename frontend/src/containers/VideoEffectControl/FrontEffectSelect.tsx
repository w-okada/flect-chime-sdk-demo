import { useVideoInputs, useSelectVideoInputDevice, FormField, Select } from "amazon-chime-sdk-component-library-react";
import { useVideoEffectState } from "../../providers/VideoEffectProvider/VideoEffectProvider";
import React from "react";
import { AsciiSetting } from "./AsciiSetting";
import { CannySetting } from "./CannySetting";
import { BlurSetting } from "./BlurSetting";
import { ColorSetting } from "./ColorSetting";

export const FrontEffectSelect: React.FC<{}> = props => {
    const { selectedDevice } = useVideoInputs({ additionalDevices: true });
    const selectDevice = useSelectVideoInputDevice();
    const { FrontEffectOptions, setFrontEffect, frontEffect, 
        asciiArtFontSizeForF, setAsciiArtFontSizeForF, 
        cannyThreshold1ForF, cannyThreshold2ForF, cannyBitwiseNotForF,
        setCannyThreshold1ForF, setCannyThreshold2ForF, setCannyBitwiseNotForF,
        bularKernelSizeForF, setBularKernelSizeForF,
        colorColorForF, setColorColorForF,
        counter, setCounter} = useVideoEffectState()
    const options = FrontEffectOptions.map(e => { return { label: e, value: e } })
    const handleChange = (e: any) => {
        setFrontEffect(e.target.value)
        console.log(e.target.value)
        if (selectDevice) {
            selectDevice(selectedDevice!)
        }
    };

    return (
        <>
            <FormField
                field={Select}
                options={options}
                onChange={handleChange}
                value={frontEffect}
                label="Select Front Effect"
                layout={'horizontal'}
            />
            <div style={{paddingLeft:15}} hidden={!(frontEffect === "Ascii")}>
                <AsciiSetting fontSize={asciiArtFontSizeForF} setFontSize={(fontSize: number) => {
                    setAsciiArtFontSizeForF(fontSize)
                    setCounter(counter+1)
                }} />
            </div>
            <div style={{ paddingLeft: 15 }} hidden={!(frontEffect === "Canny")}>
                <CannySetting 
                    threshold1={cannyThreshold1ForF} threshold2={cannyThreshold2ForF} bitwiseNot={cannyBitwiseNotForF}
                    setThreshold1={(e)=>{setCannyThreshold1ForF(e);setCounter(counter + 1)} }
                    setThreshold2={(e)=>{setCannyThreshold2ForF(e);setCounter(counter + 1)} }
                    setBitwiseNot={(e)=>{setCannyBitwiseNotForF(e);setCounter(counter + 1)} }
                 />
            </div>          
            <div style={{ paddingLeft: 15 }} hidden={!(frontEffect === "Blur")}>
                <BlurSetting kernelSize={bularKernelSizeForF} 
                    setKernelSize={(w,h)=>{setBularKernelSizeForF(w,h);setCounter(counter + 1)}}
                />
            </div>
            <div style={{ paddingLeft: 15 }} hidden={!(frontEffect === "Color")}>
                <ColorSetting color={colorColorForF} 
                    setColor={(e)=>{setColorColorForF(e);setCounter(counter + 1)}}
                />
            </div>


        </>
    );
};