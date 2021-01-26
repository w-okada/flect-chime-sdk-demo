// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const awsPath = '/Prod';
export const rootPath: string = window.location.href.includes(awsPath)
    ? `${awsPath}/`
    : '/';

const routes = {
    ROOT: `${rootPath}`,
    HOME: `${rootPath}index.html`,
    SIGNUP: `${rootPath}signup`,
    VERIFY: `${rootPath}verify`,
    SEND_VERIFICATION_CODE_FOR_CHANGE_PASSWORD: `${rootPath}send_verification_code_for_change_password`,
    NEW_PASSWORD: `${rootPath}new_password`,



    ENTRANCE: `${rootPath}entrance`,
    CREATE_MEETING_ROOM: `${rootPath}create_meeting_room`,
    WAITING_ROOM: `${rootPath}waiting_room`,
    MEETING_ROOM: `${rootPath}meeting_room`,





    // SIGNIN: `${rootPath}signin`,
    // DEVICE: `${rootPath}devices`,
    // MEETING: `${rootPath}meeting`,
    // WHITEBOARD: `${rootPath}whiteboard`,
};

export default routes;
