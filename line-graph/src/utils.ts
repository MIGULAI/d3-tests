import * as d3 from 'd3';

export const parseTime = (time: string): Date => {
  return d3.timeParse("%d/%m/%Y")(time)!;
}
export const formatTime = (time: Date): string => {
  return d3.timeFormat("%d/%m/%Y")(time);
}