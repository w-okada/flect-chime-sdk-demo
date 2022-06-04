# API の概要

## API の構成

(1) API のメインパス（meeting に関連する操作）

```
/prod/meetings/{meeting_id}/attendees/{attendee_id}
```

(2) その他の API のパス（meeting に関連しない操作）

```
/prod/operations/
```

# RestApiClient の構成

処理を記述するファイルを API の各パスで区切って管理する。
001_meetings
002_meeting
003_attendees
004_attendee
005_operation
