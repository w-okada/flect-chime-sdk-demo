// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: Apache-2.0

import { ControlBarButton, Cog, Modal, ModalHeader, ModalBody, ModalButton, ModalButtonGroup } from "amazon-chime-sdk-component-library-react";
import React, { useState } from "react";
import { BackgroundEffectSelect } from "./BackgroundEffectSelect";
import { FrontEffectSelect } from "./FrontEffectSelect";
import { VirtualBackgroundQualitySelect } from "./VirtualBackgroundQualitySelect";
import { VideoQualitySelect } from "./VideoQualitySelect";

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
            <VirtualBackgroundQualitySelect />
            
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
