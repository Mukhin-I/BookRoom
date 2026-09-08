import { describe, expect, it } from 'vitest'

import {
  getDurationMinutes,
  isValidBookingTime,
  isBookingWithinWorkingHours
} from './booking'


// тест на корректность мапинга времени
describe('getDurationMinutes', () => {
  it.each([
    ['15 мин', 15],
    ['30 мин', 30],
    ['45 мин', 45],
    ['1 час', 60],
    ['1 ч 15 мин', 75],
    ['1 ч 30 мин', 90],
    ['1 ч 45 мин', 105],
    ['2 часа', 120],
  ])(
    'возвращает %i минут для "%s"',
    (duration, expected) => {
      expect(getDurationMinutes(duration)).toBe(expected)
    },
  )
})


// тест на корректность возможного времени брони
describe('isValidBookingTime', () => {
  it.each([
    '09:00',
    '09:15',
    '12:30',
    '19:45',
  ])('принимает правильный формат %s', (time) => {
    expect(isValidBookingTime(time)).toBe(true)
  })

  it.each([
    '08:45',
    '20:00',
    '21:00',
  ])('игнорирует время вне рабочего дня: %s', (time) => {
    expect(isValidBookingTime(time)).toBe(false)
  })

  it.each([
    '09:10',
    '12:22',
    '18:59',
  ])('игнорирует время вне 15-минутного интервала: %s', (time) => {
    expect(isValidBookingTime(time)).toBe(false)
  })

  it.each([
    '',
    'hello',
    '8:00',
    '25:00',
  ])('игнорирует неправильный формат времени: %s', (time) => {
    expect(isValidBookingTime(time)).toBe(false)
  })
})

// тест на корректность доступного временного интервала бронирования
describe('isBookingWithinWorkingHours', () => {
  it('возможность брони ровно в 20:00', () => {
    expect(
      isBookingWithinWorkingHours('19:00', 60),
    ).toBe(true)
  })

  it('возможность брони в рабочие часы', () => {
    expect(
      isBookingWithinWorkingHours('15:00', 60),
    ).toBe(true)
  })

  it('запрет на бронь после 20:00', () => {
    expect(
      isBookingWithinWorkingHours('19:30', 60),
    ).toBe(false)
  })

  it('запрет на бронь до 09:00', () => {
    expect(
      isBookingWithinWorkingHours('08:30', 60),
    ).toBe(false)
  })
})