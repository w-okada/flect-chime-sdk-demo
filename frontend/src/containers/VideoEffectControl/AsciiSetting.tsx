import React from "react"
import { Flex } from "amazon-chime-sdk-component-library-react"

export const AsciiSetting:React.FC<{fontSize:number,setFontSize:(size:number)=>void}> = ({fontSize, setFontSize}) => {
    return (
      <>
        <Flex layout="fill-space-centered">
            fontsize
            <input type="range" min={2} max={10} value={fontSize} onChange={(e)=>{
                setFontSize(parseInt(e.target.value))
            }}/>
        </Flex>
      </>
    )
  }