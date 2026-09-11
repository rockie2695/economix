/**
 * Historical economic events for chart overlay annotations.
 * Each event is shown as a vertical line with a label on the chart.
 */
export interface HistoricalEvent {
  date: string;
  label: string;
  labelKey: string;
  type: "recession" | "crisis" | "policy" | "pandemic";
}

export const historicalEvents: HistoricalEvent[] = [
  // US recessions and major events
  { date: "2001-03-01", label: "Dot-com Recession", labelKey: "eventDotCom", type: "recession" },
  { date: "2001-09-11", label: "9/11 Attacks", labelKey: "event911", type: "crisis" },
  { date: "2007-12-01", label: "Great Recession Begins", labelKey: "eventGreatRecession", type: "recession" },
  { date: "2008-09-15", label: "Lehman Brothers Collapse", labelKey: "eventLehman", type: "crisis" },
  { date: "2010-03-23", label: "Obamacare Signed", labelKey: "eventObamacare", type: "policy" },
  { date: "2013-05-22", label: "Taper Tantrum", labelKey: "eventTaperTantrum", type: "policy" },
  { date: "2015-12-16", label: "Fed Rate Hike", labelKey: "eventFedHike2015", type: "policy" },
  { date: "2018-12-24", label: "Stock Market Selloff", labelKey: "event2018Selloff", type: "crisis" },
  { date: "2020-02-20", label: "COVID-19 Pandemic", labelKey: "eventCOVID", type: "pandemic" },
  { date: "2020-03-11", label: "WHO Declares Pandemic", labelKey: "eventCOVIDWHO", type: "pandemic" },
  { date: "2020-03-23", label: "COVID Market Bottom", labelKey: "eventCOVIDBottom", type: "crisis" },
  { date: "2022-02-24", label: "Russia-Ukraine War", labelKey: "eventRussiaUkraine", type: "crisis" },
  { date: "2022-03-16", label: "Fed Rate Hike Cycle", labelKey: "eventFedHike2022", type: "policy" },
  { date: "2023-03-10", label: "SVB Collapse", labelKey: "eventSVB", type: "crisis" },
];

/**
 * Filter historical events to only those within the visible date range.
 */
export function getVisibleEvents(startDate: string, endDate: string): HistoricalEvent[] {
  return historicalEvents.filter(
    (event) => event.date >= startDate && event.date <= endDate
  );
}
