import { beforeEach, describe, expect, it } from 'vitest';
import { getRecentClassIds, recordClassVisit } from './recentClasses';

describe('recentClasses', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records a visit and returns it as the most recent class', () => {
    recordClassVisit('class-1');
    expect(getRecentClassIds(5)).toEqual(['class-1']);
  });

  it('moves a re-visited class back to the front without duplicating it', () => {
    recordClassVisit('class-1');
    recordClassVisit('class-2');
    recordClassVisit('class-1');
    expect(getRecentClassIds(5)).toEqual(['class-1', 'class-2']);
  });

  it('limits results to the requested count', () => {
    recordClassVisit('class-1');
    recordClassVisit('class-2');
    recordClassVisit('class-3');
    expect(getRecentClassIds(2)).toEqual(['class-3', 'class-2']);
  });

  it('returns an empty array when nothing has been visited', () => {
    expect(getRecentClassIds(5)).toEqual([]);
  });
});
