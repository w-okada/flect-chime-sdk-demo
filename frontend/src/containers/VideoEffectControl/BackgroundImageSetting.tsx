import React from "react"
import { Flex, Button } from "amazon-chime-sdk-component-library-react"

export const BackgroundImageSetting:React.FC<{setBackgroundImage:(img:HTMLImageElement)=>void}> = ({setBackgroundImage}) => {
    const handleVirtualBackgroundImageButtonClicked = (e: any) => {
      const input = document.createElement("input")
      input.type = "file"
      input.onchange = (file: any) => {
        console.log(file.target.files[0])
        const fileType = file.target.files[0].type
        if (fileType.startsWith("image")) {
          const path = URL.createObjectURL(file.target.files[0]);
          const img = document.createElement("img")
          img.src = path
          img.onload = () => {
            setBackgroundImage(img)
          }
        }
      }
      input.click()
    }
    return (
      <>
        <Flex layout="fill-space-centered">
          Image file:
          <Button label="Choose File" onClick={handleVirtualBackgroundImageButtonClicked} />
        </Flex>
      </>
    )
  }