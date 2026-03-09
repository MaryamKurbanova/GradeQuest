import { buildReminderPlan, type ReminderPreferences } from "../ReminderFactory";
import type { Assignment, Exam } from "../../../../types/entities";

const BASE_PREFERENCES: ReminderPreferences = {
  notificationsEnabled: true,
  assignmentRemindersEnabled: true,
  examRemindersEnabled: true,
  streakNudgesEnabled: true,
  reminderStyle: "standard",
  persistentRemindersEnabled: false,
  nudgeCadence: "daily",
  snoozePresetsMinutes: [30, 120],
};

const makeAssignment = (overrides: Partial<Assignment>): Assignment => ({
  id: "assignment-1",
  courseId: "course-1",
  title: "Assignment",
  notes: null,
  dueAt: "2026-03-09 18:00",
  priority: "medium",
  status: "pending",
  completedAt: null,
  createdAt: "2026-03-08T00:00:00.000Z",
  updatedAt: "2026-03-08T00:00:00.000Z",
  ...overrides,
});

const makeExam = (overrides: Partial<Exam>): Exam => ({
  id: "exam-1",
  courseId: "course-1",
  title: "Exam",
  examAt: "2026-03-10 09:00",
  weightPercent: 35,
  notes: null,
  status: "upcoming",
  completedAt: null,
  createdAt: "2026-03-08T00:00:00.000Z",
  updatedAt: "2026-03-08T00:00:00.000Z",
  ...overrides,
});

describe("ReminderFactory", () => {
  it("returns no reminders when notifications are disabled", () => {
    const reminders = buildReminderPlan({
      assignments: [makeAssignment({})],
      exams: [makeExam({})],
      streakDays: 3,
      preferences: { ...BASE_PREFERENCES, notificationsEnabled: false },
      now: new Date("2026-03-08T10:00:00.000Z"),
    });

    expect(reminders).toHaveLength(0);
  });

  it("builds assignment, exam, and streak reminders", () => {
    const reminders = buildReminderPlan({
      assignments: [makeAssignment({})],
      exams: [makeExam({})],
      streakDays: 4,
      preferences: BASE_PREFERENCES,
      now: new Date("2026-03-08T10:00:00.000Z"),
    });

    expect(reminders.length).toBeGreaterThanOrEqual(3);
    expect(reminders.some((item) => item.kind === "assignmentDue")).toBe(true);
    expect(reminders.some((item) => item.kind === "examDue")).toBe(true);
    expect(reminders.some((item) => item.kind === "streakNudge")).toBe(true);
  });

  it("rolls daily streak nudge to next day when today's slot passed", () => {
    const now = new Date("2026-03-08T22:00:00.000Z");
    const reminders = buildReminderPlan({
      assignments: [],
      exams: [],
      streakDays: 9,
      preferences: {
        ...BASE_PREFERENCES,
        assignmentRemindersEnabled: false,
        examRemindersEnabled: false,
        nudgeCadence: "daily",
      },
      now,
    });

    expect(reminders).toHaveLength(1);
    const nextReminder = new Date(reminders[0].fireAt);
    expect(nextReminder.getTime()).toBeGreaterThan(now.getTime() + 10 * 60 * 60 * 1000);
  });
});
