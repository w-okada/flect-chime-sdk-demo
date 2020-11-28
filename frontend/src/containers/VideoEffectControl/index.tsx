// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: Apache-2.0

import { ControlBarButton, Cog, Modal, ModalHeader, ModalBody, ModalButton, ModalButtonGroup, useVideoInputs, useSelectVideoInputDevice, Flex, RadioGroup, Button } from "amazon-chime-sdk-component-library-react";
import React, { useState } from "react";
import { StyledP } from "../EndMeetingControl/Styled";
import { useVideoEffectState } from "../../providers/VideoEffectProvider/VideoEffectProvider";

const FrontEffectSelect: React.FC<{}> = props => {
  const { selectedDevice } = useVideoInputs({ additionalDevices: true });
  const selectDevice = useSelectVideoInputDevice();
  const { frontEffectOptions, setFrontEffect, frontEffect } = useVideoEffectState()
  const options = frontEffectOptions.map(e => { return { label: e, value: e } })
  const handleChange = (e: any) => {
    setFrontEffect(e.target.value)
    console.log(e.target.value)
    if (selectDevice) {
      selectDevice(selectedDevice!)
    }
  };

  return (
    <>
      <StyledP>
        Select Front Effect
      </StyledP>
      <Flex layout="equal-columns">
        <RadioGroup
          options={options}
          value={frontEffect}
          onChange={handleChange}
        />
      </Flex>
    </>
  );
};



const BackgroundEffectSelect: React.FC<{}> = props => {
  const { selectedDevice } = useVideoInputs({ additionalDevices: true });
  const selectDevice = useSelectVideoInputDevice();
  const { backgroundEffectOptions, setBackgroundEffect, backgroundEffect, setBackgroundImage, setBackgroundMediaStream } = useVideoEffectState()
  const options = backgroundEffectOptions.map(e => { return { label: e, value: e } })
  const handleBackendEffectChange = (e: any) => {
    setBackgroundEffect(e.target.value)
    if (selectDevice) {
      selectDevice(selectedDevice!)
    }
  }

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
          if (selectDevice) {
            selectDevice(selectedDevice!)
          }

        }
      }
    }
    input.click()
  }
  const handleVirtualBackgroundWindowButtonClicked = (e: any) => {
    console.log("window...")
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
    navigator.mediaDevices.getDisplayMedia({ frameRate: { max: 15, } }).then(media => {
      setBackgroundMediaStream(media)
      console.log(media)
      if (selectDevice) {
        selectDevice(selectedDevice!)
      }
    })
  }

  return (
    <>
      <StyledP>
        Select Background Effect
      </StyledP>
      <Flex layout="equal-columns">
        <RadioGroup
          options={options}
          value={backgroundEffect}
          onChange={handleBackendEffectChange}
        />
      </Flex>

      <div hidden={!(backgroundEffect === "Image")}>
        <StyledP>
          Virtual Background Image
        </StyledP>
        <Flex layout="fill-space-centered">
          <Button label="Choose File" onClick={handleVirtualBackgroundImageButtonClicked} />
        </Flex>
      </div>

      <div hidden={!(backgroundEffect === "Window")}>
        <StyledP>
          Virtual Background Window
        </StyledP>
        <Flex layout="fill-space-centered">
          <Button label="Choose Window" onClick={handleVirtualBackgroundWindowButtonClicked} />
        </Flex>
      </div>
    </>
  );
};

const VideoQualitySelect: React.FC<{}> = props => {
  const { VideoQualityOptions, selectQuality, videoQuality } = useVideoEffectState()
  const options = VideoQualityOptions.map(e => { return { label: e, value: e } })

  const handleChange = (e: any) => {
    selectQuality(e.target.value)
  };

  return (
    <>
      <StyledP>
        Video Quality
      </StyledP>
      <Flex layout="equal-columns">
        <RadioGroup
          options={options}
          value={videoQuality}
          onChange={handleChange}
        />
      </Flex>
    </>
  );
};


const VideoEffectControl: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);


  return (
    <>
      <ControlBarButton icon={<Cog />} onClick={toggleModal} label="Setting" />
      {showModal && (
        <Modal size="md" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="Configure your setting" />
          <ModalBody>
            <FrontEffectSelect />
            <BackgroundEffectSelect />
            <VideoQualitySelect />
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton variant="secondary" label="Close" closesModal />
            ]}
          />
        </Modal>
      )}
    </>
  );
};

export default VideoEffectControl;
