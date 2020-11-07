import React from 'react';
import {
  useNotificationState,
  NotificationGroup
} from 'amazon-chime-sdk-component-library-react';

const Notifications = () => {
  const { notifications } = useNotificationState();

  return notifications.length ? <NotificationGroup /> : null;
};

export default Notifications;