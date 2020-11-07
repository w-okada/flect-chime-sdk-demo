// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Versioning } from 'amazon-chime-sdk-component-library-react';

export const VersionLabel = () => {
  return (
    <span
      style={{
        position: 'absolute',
        bottom: 1,
        right: 1,
        color: '#989da5',
        fontSize: '0.70rem'
      }}
    >
      Flect Amazon Chime Demo with {Versioning.sdkName}@{Versioning.sdkVersion} forked from &nbsp;
      <a style={{color: '#989da5'}} href="https://github.com/aws/amazon-chime-sdk-component-library-react/tree/master/demo/meeting">
        here
      </a>
    </span>
  );
};
