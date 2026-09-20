# Board Responsive Styling & Aesthetic Checklist

## Breakpoint Matrix
| Breakpoint | Width Range | Expected Layout | Min Pit Size |
| :--- | :--- | :--- | :--- |
| **Mobile Portrait** | $320\text{px} - 480\text{px}$ | Compact 2-row grid with horizontal overflow prevention or scalable SVG | $48\text{px} \times 48\text{px}$ |
| **Tablet Portrait / Mobile Landscape** | $481\text{px} - 768\text{px}$ | Two balanced rows (North [11..6], South [0..5]) with flanking Ojú-oró banks | $56\text{px} \times 56\text{px}$ |
| **Desktop** | $\ge 1024\text{px}$ | Full artisanal wooden carved board with realistic woodgrain bevels and bank hollows | $72\text{px} \times 72\text{px}$ |

## Comprehensive Aesthetic & Structural Audit Checklist
- [ ] **Row Inversion**: North row is rendered visually as `[11, 10, 9, 8, 7, 6]` left-to-right.
- [ ] **Row Inversion**: South row is rendered visually as `[0, 1, 2, 3, 4, 5]` left-to-right.
- [ ] **Empty Pits**: Pits with 0 seeds render recessed hollow shadow only; NO "0" badge or pebble graphic.
- [ ] **Clustering Threshold**: Pits with $\ge 5$ seeds render exactly 3 overlapping pebbles + 1 centered `#EAD8C7` count badge.
- [ ] **Main Board Chassis**: Linear gradient `#23120B` to `#351A0E` with polished mahogany timber feel.
- [ ] **Outer Border / Bevel**: 3D bevel with warm amber highlights `#5C3119` - `#7A4222`.
- [ ] **Pit Inset Shadow**: Deep hollow inset shadow `inset 0 8px 16px rgba(0,0,0,0.9), inset 0 -2px 4px rgba(92,49,25,0.3)`.
- [ ] **Ojú-oró Storehouses**: Positioned on West (North bank) and East (South bank) ends of the wooden chassis.
- [ ] **Seed Color Gradient**: Earthy matte green `#53624D` to `#414E3C` with chalky mineral specks `#73836C`.
- [ ] **Active Pit Hover**: Subtle warm golden amber glow (`box-shadow: 0 0 12px rgba(218, 165, 32, 0.4)`).
- [ ] **Touch Targets**: All 12 hollows maintain $\ge 48\text{px} \times 48\text{px}$ hit-box on mobile viewports.
