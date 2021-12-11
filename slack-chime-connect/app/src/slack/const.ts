export const ActionIds = {
    AttendeeNameInputAction: "AttendeeNameInputAction",
    DefaultSettingChangeAction: "DefaultSettingChangeAction",
    EnterMeeting: "EnterMeeting",
} as const;
export type ActionIds = typeof ActionIds[keyof typeof ActionIds];
