"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AvailabilityRule, ManualBlock, ClosedDay } from "@/types/calendar";
import type { Appointment } from "@/types";
import {
  defaultAvailabilityRules,
  defaultManualBlocks,
  defaultClosedDays,
} from "@/data/mockCalendar";
import {
  isDateClosed as _isDateClosed,
  isDayAvailableForBooking as _isDayAvailable,
  getAvailableSlots as _getAvailableSlots,
  getBlocksForDate as _getBlocksForDate,
} from "@/services/calendarService";

interface CalendarContextValue {
  availabilityRules: AvailabilityRule[];
  manualBlocks: ManualBlock[];
  closedDays: ClosedDay[];
  isDateClosed: (date: string) => boolean;
  isDayAvailableForBooking: (date: string) => boolean;
  getAvailableSlots: (date: string, durationMin: number, appointments: Appointment[]) => string[];
  getBlocksForDate: (date: string) => ManualBlock[];
  getClosedDay: (date: string) => ClosedDay | undefined;
  updateRules: (rules: AvailabilityRule[]) => void;
  addManualBlock: (data: Omit<ManualBlock, "id" | "createdAt">) => ManualBlock;
  removeManualBlock: (id: string) => void;
  closeDay: (date: string, reason?: string) => void;
  reopenDay: (date: string) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AvailabilityRule[]>(defaultAvailabilityRules);
  const [blocks, setBlocks] = useState<ManualBlock[]>(defaultManualBlocks);
  const [closed, setClosed] = useState<ClosedDay[]>(defaultClosedDays);

  const isDateClosed = useCallback((date: string) => _isDateClosed(date, closed), [closed]);

  const isDayAvailableForBooking = useCallback(
    (date: string) => _isDayAvailable(date, rules, closed),
    [rules, closed]
  );

  const getAvailableSlots = useCallback(
    (date: string, durationMin: number, appointments: Appointment[]) =>
      _getAvailableSlots(date, durationMin, rules, blocks, closed, appointments),
    [rules, blocks, closed]
  );

  const getBlocksForDate = useCallback(
    (date: string) => _getBlocksForDate(date, blocks),
    [blocks]
  );

  const getClosedDay = useCallback(
    (date: string) => closed.find((cd) => cd.date === date && cd.isActive),
    [closed]
  );

  const updateRules = useCallback((newRules: AvailabilityRule[]) => setRules(newRules), []);

  const addManualBlock = useCallback(
    (data: Omit<ManualBlock, "id" | "createdAt">): ManualBlock => {
      const block: ManualBlock = {
        ...data,
        id: `mb-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setBlocks((prev) => [...prev, block]);
      return block;
    },
    []
  );

  const removeManualBlock = useCallback(
    (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id)),
    []
  );

  const closeDay = useCallback(
    (date: string, reason?: string) => {
      setClosed((prev) => {
        if (prev.some((cd) => cd.date === date && cd.isActive)) return prev;
        return [
          ...prev,
          {
            id: `cd-${Date.now()}`,
            date,
            reason,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    },
    []
  );

  const reopenDay = useCallback(
    (date: string) => setClosed((prev) => prev.filter((cd) => cd.date !== date)),
    []
  );

  return (
    <CalendarContext.Provider
      value={{
        availabilityRules: rules,
        manualBlocks: blocks,
        closedDays: closed,
        isDateClosed,
        isDayAvailableForBooking,
        getAvailableSlots,
        getBlocksForDate,
        getClosedDay,
        updateRules,
        addManualBlock,
        removeManualBlock,
        closeDay,
        reopenDay,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used inside CalendarProvider");
  return ctx;
}
