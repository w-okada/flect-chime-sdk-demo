import React from "react"
import { Flex } from "amazon-chime-sdk-component-library-react"

export const BlurSetting:React.FC<{kernelSize:number,setKernelSize:(w:number, h:number)=>void}> = ({kernelSize, setKernelSize}) => {
    return (
      <>
        <Flex layout="fill-space-centered">
            Strength
            <input type="range" min={2} max={50} value={kernelSize} onChange={(e)=>{
                console.log(e.target.value)
                setKernelSize(parseInt(e.target.value), parseInt(e.target.value))
            }}/>
        </Flex>
      </>
    )
  }