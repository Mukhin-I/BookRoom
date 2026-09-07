export const getDurationMinutes = (duration: string): number => {
  const durationMap: Record<string, number> = {
    '15 мин': 15,
    '30 мин': 30,
    '45 мин': 45,
    '1 час': 60,
    '1 ч 15 мин': 75,
    '1 ч 30 мин': 90,
    '1 ч 45 мин': 105,
    '2 часа': 120,
  }

  return durationMap[duration]
}

export const isValidBookingTime = (time: string): boolean => {
  const match = /^([01]\d|20):([0-5]\d)$/.exec(time)

  if (!match) {
    return false
  }

  const [hours, minutes] = time.split(':').map(Number)

  if (minutes % 15 !== 0) {
    return false
  }

  return hours >= 9 && hours < 20
}

export const isBookingWithinWorkingHours = (
  startTime: string,
  durationMinutes: number,
): boolean => {
  const [hours, minutes] = startTime.split(':').map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false
  }

  const startInMinutes = hours * 60 + minutes
  const endInMinutes = startInMinutes + durationMinutes

  return startInMinutes >= 9 * 60 &&
    endInMinutes <= 20 * 60
}