import React from "react"
import { Flex, Button } from "amazon-chime-sdk-component-library-react"

export const BackgroundWindowSetting:React.FC<{setBackgroundWindow:(stream:MediaStream)=>void}> = ({setBackgroundWindow}) => {

    const handleVirtualBackgroundWindowButtonClicked = (e: any) => {
      console.log("window...")
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
      navigator.mediaDevices.getDisplayMedia({ frameRate: { max: 15, } }).then(media => {
        setBackgroundWindow(media)
        // console.log(media)
        // if (selectDevice) {
        //   selectDevice(selectedDevice!)
        // }
      })
    }    
    return (
      <>
        <Flex layout="fill-space-centered">
          window:
          <Button label="Choose Window" onClick={handleVirtualBackgroundWindowButtonClicked} />
        </Flex>
      </>
    )
  }