import { useEffect } from "react"

import { registerNotificationSoundClient } from "../utils/notificationSound"

export function PushNotificationSoundListener() {
  useEffect(() => registerNotificationSoundClient(), [])
  return null
}
