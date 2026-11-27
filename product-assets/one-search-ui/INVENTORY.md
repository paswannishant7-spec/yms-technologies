# One Search interface inventory

The supplied `RTO & Railway` folder contains 34 PNGs, 67 SVGs and one PDF design board. The website also has three earlier app-reference JPEGs and the supplied app logo. The gallery presents 15 distinct screens and interface details. The application’s implementation status and the sample data shown on the board have not been independently verified. The site identifies gallery and walkthrough content as design previews.

| Gallery entry | Source | Published pixels | What it shows |
| --- | --- | ---: | --- |
| Welcome screen | PDF board, opening sequence | 479 × 1078 | App mark and transport illustration at introduction |
| App home | `Home Revised.png` | 360 × 823 | Grouped vehicle and railway shortcuts |
| Service discovery | `Android Compact - 26.png` | 360 × 823 | The alternative discovery surface with illustrated service panels |
| Train search | `Android Compact - 35.png` | 360 × 668 | Railway tab, origin, destination, journey date and shortcuts |
| Train results | PDF board, Train Search group | 479 × 1183 | Train-name lookup and sample train cards with schedule links |
| Train schedule | PDF board, Train Schedule group | 479 × 1181 | Train summary and stop-by-stop timetable columns |
| Station details | PDF board, Station Details group | 479 × 1168 | Station identification and example upcoming train cards |
| Railway card actions | `Frame 65.png` | 328 × 50 | The actions shown below a train result card |
| Flight search | `Android Compact - 34.png` | 360 × 668 | Flight tab and route/date search fields |
| Route results | PDF board, Airline Route Finder group | 479 × 1163 | Sample direct and one-stop route groups |
| Route details | PDF board, Airline Route Finder group | 479 × 1163 | Sample dates, departure and arrival, aircraft and days of operation |
| Vehicle services | Existing genuine app-reference conversion | 600 × 826 | Vehicle tab and navigation to help users choose a service |
| Vehicle lookup | `Vehicle Search.png` | 360 × 876 | Registration-number input and an empty recent-searches state |
| Vehicle service shortcuts | `Section - Promotional Banner.png` | 360 × 262 | Design component showing the service-card options |
| Traffic Rules card | `Group 18.png` | 334 × 169 | Illustrated navigation card to the Traffic Rules design |

The standalone Railway and Flight PNGs are cropped below their interface actions to remove the empty ad strip. The portrait renders taken from the attached PDF preserve the original screen content. The small, standalone PNG details are shown as gallery cards rather than mapped onto a phone. `Group 2147223793.png` is branding artwork used independently in the introduction and support block. `scripts/prepare-one-search-ui.mjs` compresses the checked-in source PNGs, and `src/content/one-search.ts` is the web manifest.

The production walkthrough goes from Railway entry to results, timetable and station information, from Flight entry to grouped routes and a route detail, and from the vehicle services overview to the blank lookup. The gallery also covers welcome, home and supporting controls. The Train Search board state illustrates a separate train-name lookup. The transition on the website makes that distinction in the chapter copy.

Other supplied images are alternate home or theme drafts, UI fragments, icons, borders, loading placeholders and art that already appears inside the selected screens. The mismatched Flight-highlighted vehicle export is represented by the coherent app-reference overview and the standalone Vehicle Search screen. The long design board also contains account, traffic guidance and vehicle results mockups. The public walkthrough has no identifiable vehicle-owner details and does not present draft driving guidance, account flows, booking, or live transport status as product capabilities.
