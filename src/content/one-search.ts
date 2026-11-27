export type ScreenCategory = "Overview" | "Railway" | "Flight" | "RTO";

function screen(id: string, category: ScreenCategory, label: string, width: number, height: number, alt: string, detail = false) {
  return { id, category, label, width, height, alt, detail, image: id === "rto-overview" ? "/media/one-search-rto.webp" : `/media/one-search-ui/${id}.webp` };
}

// Indices remain stable for the hero and the product phone. Gallery-only details follow the device screens.
export const productScreens = [
  screen("railway", "Railway", "Train search", 360, 668, "Railway interface with origin, destination and journey date fields"),
  screen("flight", "Flight", "Flight search", 360, 668, "Flight interface with origin, destination and journey date fields"),
  screen("rto-overview", "RTO", "Vehicle services", 600, 826, "One Search vehicle overview with a search field and vehicle service links"),
  screen("vehicle-search", "RTO", "Vehicle lookup", 360, 876, "Vehicle Search design with a vehicle number field and an empty recent-searches state"),
  screen("home", "Overview", "App home", 360, 823, "One Search home design with grouped vehicle and railway shortcuts"),
  screen("rail-results", "Railway", "Train results", 479, 1183, "Example train search cards with station names, operating days and schedule links"),
  screen("rail-timetable", "Railway", "Train schedule", 479, 1181, "Example train schedule showing the stops, arrival and departure columns"),
  screen("flight-results", "Flight", "Route results", 479, 1163, "Example flight route results grouped by direct and one-stop routes"),
  screen("flight-details", "Flight", "Route details", 479, 1163, "Example airline route details with date, cities, aircraft and operating days"),
  screen("rail-stations", "Railway", "Station details", 479, 1168, "Example station details layout with station code and upcoming train cards"),
  screen("welcome", "Overview", "Welcome screen", 479, 1078, "One Search welcome artwork with an aircraft, car and train around the app mark"),
  screen("home-services", "Overview", "Service discovery", 360, 823, "Home design showing the vehicle services and railway information shortcuts"),
  screen("vehicle-services", "RTO", "Vehicle service shortcuts", 360, 262, "Vehicle services design component with search, licence and office shortcuts", true),
  screen("traffic-rules-card", "RTO", "Traffic Rules card", 334, 169, "Traffic Rules design component with traffic-light and road-sign artwork", true),
  screen("rail-tools", "Railway", "Railway card actions", 328, 50, "Design component showing the actions at the bottom of a train card", true),
] as const;

export const productViews = [
  {
    id: "railway", label: "Railway", title: "Plan a railway journey.", screens: [0, 5, 6, 9],
    description: "Start with a departure station, destination and journey date. Explore a sample train card, then see how a timetable or station detail could organise the next layer of information.",
    paragraphs: [
      "The Railway search design gives the route and date their own fields. That makes the starting point clear whether you know both stations already or are still working out which station serves the place you want. The entry screen also groups shortcuts separately from the form, so someone looking for a particular train or station has another way in.",
      "Open Train results to see a separate lookup by train name or number. Its sample cards place the train identifier, endpoints and operating days together. The Train schedule screen then switches from a summary to a station-by-station timetable. Station details frames the same information around one station instead of one train, which is useful when the station is the part of the journey you know first.",
    ],
  },
  {
    id: "flight", label: "Flight", title: "Look up flights by route.", screens: [1, 7, 8],
    description: "Choose the origin, destination and date. The design shows how an airline route finder could group direct and one-stop options and present a route in more detail.",
    paragraphs: [
      "The Flight entry view keeps the familiar origin, destination and date pattern. The wording and visual cues shift to air travel, but the starting question stays the same. This is particularly handy when you are exploring the same trip by different modes and want to see what information each search asks for.",
      "The Route results prototype groups direct and one-stop routes. In the Route details prototype, each card adds sample cities, dates, aircraft and operating days. Airport and airline names, times, counts and status labels in the artwork are examples from the design board. Use the gallery to inspect the hierarchy and compare views at their full proportions.",
    ],
  },
  {
    id: "rto", label: "RTO", title: "Find vehicle information.", screens: [2, 3],
    description: "Start with vehicle services, then open the dedicated lookup to search by vehicle number. This preview uses an empty recent-searches state.",
    paragraphs: [
      "The Vehicle section changes the search input from a place or date to a registration number. The overview groups the lookup with other vehicle-service shortcuts, while the dedicated Vehicle Search screen gives it its own heading, single input and recent-searches area. The empty state shows where a user would start before making a lookup.",
      "The separate vehicle-services and Traffic Rules cards in the gallery show how supporting topics fit into the proposed navigation. Those cards are interface previews. The public showcase uses the search and discovery screens, with no vehicle-owner names, personal records or identifiable search results.",
    ],
  },
] as const;

export const productQuestions = [
  ["What is One Search?", "One Search is a YMS Technologies product that brings railway, flight and vehicle information categories into one mobile interface. The gallery shows the supplied designs and app references for those categories."],
  ["Can I run a search from this page?", "The controls on this page change interface previews. Select a category and then choose a screen to see the next view. The example numbers, dates and route records are design content."],
  ["What can I explore in the Railway and Flight previews?", "Railway includes a route entry view, sample train cards, a timetable and station details. Flight includes an entry view, route results and route details. The screen labels identify the examples so you can trace the different parts of each design."],
  ["Why are there two vehicle screens?", "The services overview shows the selection of vehicle-related topics. Vehicle lookup shows the dedicated registration-number interface and its empty recent-searches state."],
  ["Where can I download the app?", "A verified store listing is still needed before this site can link to a download. For a question about availability, use One Search Support."],
  ["Where can I get help?", "Open One Search Support and identify the feature and step where you need help. Include the app version and device model if you know them. Keep vehicle numbers, identity documents and passwords out of your message."],
] as const;
