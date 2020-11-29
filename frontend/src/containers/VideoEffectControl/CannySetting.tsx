import React from "react"
import { Flex, Checkbox } from "amazon-chime-sdk-component-library-react"

interface CannySettingProp{
  setThreshold1: (val:number) => void
  setThreshold2: (val:number) => void
  setBitwiseNot: (val:boolean) => void
  threshold1: number
  threshold2: number
  bitwiseNot: boolean
}

export const CannySetting:React.FC<CannySettingProp> = ({setThreshold1, setThreshold2, threshold1, threshold2, bitwiseNot, setBitwiseNot}) => {
    return (
      <>
        <Flex layout="fill-space-centered">
            th1
            <input type="range" min={10} max={100} step={10} value={threshold1} onChange={(e)=>{
                setThreshold1(parseInt(e.target.value))
            }}/>
            th2
            <input type="range" min={10} max={100} step={10} value={threshold2} onChange={(e)=>{
                setThreshold2(parseInt(e.target.value))
            }}/>
            nega
            <Checkbox value="" checked={bitwiseNot}
              onChange={(e) => { 
                setBitwiseNot(!bitwiseNot)
              }}
              aria-label="checkbox label"
            />
        </Flex>

      </>
    )
  }