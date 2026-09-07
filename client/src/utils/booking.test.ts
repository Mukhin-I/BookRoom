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
    'returns %i minutes for "%s"',
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
  ])('accepts valid time %s', (time) => {
    expect(isValidBookingTime(time)).toBe(true)
  })

  it.each([
    '08:45',
    '20:00',
    '21:00',
  ])('rejects time outside working hours: %s', (time) => {
    expect(isValidBookingTime(time)).toBe(false)
  })

  it.each([
    '09:10',
    '12:22',
    '18:59',
  ])('rejects time that is not divisible into 15-minute intervals: %s', (time) => {
    expect(isValidBookingTime(time)).toBe(false)
  })

  it.each([
    '',
    'hello',
    '8:00',
    '25:00',
  ])('rejects invalid time format: %s', (time) => {
    expect(isValidBookingTime(time)).toBe(false)
  })
})

// тест на корректность доступного временного интервала бронирования
describe('isBookingWithinWorkingHours', () => {
  it('allows a booking that ends exactly at 20:00', () => {
    expect(
      isBookingWithinWorkingHours('19:00', 60),
    ).toBe(true)
  })

  it('allows a booking inside working hours', () => {
    expect(
      isBookingWithinWorkingHours('15:00', 60),
    ).toBe(true)
  })

  it('rejects a booking that ends after 20:00', () => {
    expect(
      isBookingWithinWorkingHours('19:30', 60),
    ).toBe(false)
  })

  it('rejects a booking before 09:00', () => {
    expect(
      isBookingWithinWorkingHours('08:30', 60),
    ).toBe(false)
  })
})