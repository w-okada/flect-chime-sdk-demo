import React from "react"
import { Flex } from "amazon-chime-sdk-component-library-react"

export const ColorSetting:React.FC<{color:string,setColor:(color:string)=>void}> = ({color, setColor}) => {
    return (
      <>
        <Flex layout="fill-space-centered">
            fontsize
            <input type="color" value={color} onChange={(e)=>{
                setColor(e.target.value)
            }}/>
        </Flex>
      </>
    )
  }