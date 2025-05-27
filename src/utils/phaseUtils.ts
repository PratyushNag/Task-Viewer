/**
 * Phase utility functions for mapping weeks to phases
 */

/**
 * Maps week numbers to their corresponding phase
 * Based on the correct phase structure defined in the application
 */
export const getPhaseForWeek = (weekNumber: number): number => {
  // Correct phase mapping based on week ranges (phases 1-6)
  // Phase 1: Weeks 1-8
  // Phase 2: Weeks 9-16
  // Phase 3: Weeks 17-25
  // Phase 4: Weeks 26-40
  // Phase 5: Weeks 41-54
  // Phase 6: Weeks 55-68

  if (weekNumber >= 1 && weekNumber <= 8) {
    return 1; // Phase 1
  } else if (weekNumber >= 9 && weekNumber <= 16) {
    return 2; // Phase 2
  } else if (weekNumber >= 17 && weekNumber <= 25) {
    return 3; // Phase 3
  } else if (weekNumber >= 26 && weekNumber <= 40) {
    return 4; // Phase 4
  } else if (weekNumber >= 41 && weekNumber <= 54) {
    return 5; // Phase 5
  } else if (weekNumber >= 55 && weekNumber <= 68) {
    return 6; // Phase 6
  } else {
    // Default to phase 1 for weeks outside the defined range
    return 1;
  }
};

/**
 * Gets the week range for a given phase
 */
export const getWeekRangeForPhase = (phase: number): { start: number; end: number } => {
  switch (phase) {
    case 1:
      return { start: 1, end: 8 };
    case 2:
      return { start: 9, end: 16 };
    case 3:
      return { start: 17, end: 25 };
    case 4:
      return { start: 26, end: 40 };
    case 5:
      return { start: 41, end: 54 };
    case 6:
      return { start: 55, end: 68 };
    default:
      return { start: 1, end: 8 }; // Default to phase 1
  }
};

/**
 * Gets all weeks that belong to a specific phase
 */
export const getWeeksForPhase = (phase: number): number[] => {
  const { start, end } = getWeekRangeForPhase(phase);
  const weeks: number[] = [];

  for (let week = start; week <= end; week++) {
    weeks.push(week);
  }

  return weeks;
};

/**
 * Gets the phase name for a given phase number
 */
export const getPhaseName = (phase: number): string => {
  const phaseNames: Record<number, string> = {
    1: 'Phase 1: Foundation & Basics',
    2: 'Phase 2: Core Syllabus Development',
    3: 'Phase 3: Advanced Topics & Integration',
    4: 'Phase 4: Comprehensive Coverage',
    5: 'Phase 5: Revision & Practice',
    6: 'Phase 6: Final Preparation'
  };
  return phaseNames[phase] || `Phase ${phase}`;
};
