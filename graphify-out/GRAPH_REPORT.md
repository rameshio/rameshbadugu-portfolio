# Graph Report - .  (2026-07-04)

## Corpus Check
- Corpus is ~8,639 words - fits in a single context window. You may not need a graph.

## Summary
- 80 nodes · 91 edges · 15 communities (8 shown, 7 thin omitted)
- Extraction: 95% EXTRACTED · 1% INFERRED · 4% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 55,551 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Entry & Build Assets|App Entry & Build Assets]]
- [[_COMMUNITY_Dev Tooling Config|Dev Tooling Config]]
- [[_COMMUNITY_Package Metadata & Scripts|Package Metadata & Scripts]]
- [[_COMMUNITY_3D & Animation Dependencies|3D & Animation Dependencies]]
- [[_COMMUNITY_Core App & Igris Section|Core App & Igris Section]]
- [[_COMMUNITY_Hero Section|Hero Section]]
- [[_COMMUNITY_Skills Section|Skills Section]]
- [[_COMMUNITY_Background Particle Effects|Background Particle Effects]]
- [[_COMMUNITY_Experience Section|Experience Section]]
- [[_COMMUNITY_Navigation Bar|Navigation Bar]]
- [[_COMMUNITY_Projects Section|Projects Section]]
- [[_COMMUNITY_Resume Section|Resume Section]]
- [[_COMMUNITY_Glow Effect Component|Glow Effect Component]]

## God Nodes (most connected - your core abstractions)
1. `scripts` - 5 edges
2. `Vite` - 4 edges
3. `src/main.jsx (React app entry)` - 4 edges
4. `react.svg (React logo)` - 3 edges
5. `react` - 2 edges
6. `vite` - 2 edges
7. `App()` - 2 edges
8. `About()` - 2 edges
9. `BackgroundParticles()` - 2 edges
10. `Contact()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `react.svg (React logo)` --SCAFFOLDED_BY--> `Vite`  [AMBIGUOUS]
  src/assets/react.svg → README.md
- `vite.svg (Vite logo)` --SCAFFOLDED_BY--> `Vite`  [AMBIGUOUS]
  src/assets/vite.svg → README.md
- `icons.svg (UI icon sprite sheet)` --USED_BY--> `src/main.jsx (React app entry)`  [AMBIGUOUS]
  public/icons.svg → index.html
- `react.svg (React logo)` --USED_BY--> `src/main.jsx (React app entry)`  [AMBIGUOUS]
  src/assets/react.svg → index.html
- `src/main.jsx (React app entry)` --USES--> `React`  [INFERRED]
  index.html → README.md

## Import Cycles
- None detected.

## Communities (15 total, 7 thin omitted)

### Community 0 - "App Entry & Build Assets"
Cohesion: 0.22
Nodes (9): icons.svg (UI icon sprite sheet), react.svg (React logo), vite.svg (Vite logo), react, vite, src/main.jsx (React app entry), README.md (React + Vite template doc), React (+1 more)

### Community 1 - "Dev Tooling Config"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, tailwindcss, @tailwindcss/vite (+3 more)

### Community 2 - "Package Metadata & Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 3 - "3D & Animation Dependencies"
Cohesion: 0.20
Nodes (10): dependencies, canvas-confetti, @emailjs/browser, framer-motion, gsap, lucide-react, react-dom, @react-three/drei (+2 more)

### Community 4 - "Core App & Igris Section"
Cohesion: 0.33
Nodes (4): App(), About(), Contact(), Igris()

### Community 6 - "Skills Section"
Cohesion: 0.40
Nodes (4): cardVariants, containerVariants, skillCategories, Skills()

## Ambiguous Edges - Review These
- `Vite` → `react.svg (React logo)`  [AMBIGUOUS]
  src/assets/react.svg · relation: SCAFFOLDED_BY
- `Vite` → `vite.svg (Vite logo)`  [AMBIGUOUS]
  src/assets/vite.svg · relation: SCAFFOLDED_BY
- `src/main.jsx (React app entry)` → `icons.svg (UI icon sprite sheet)`  [AMBIGUOUS]
  public/icons.svg · relation: USED_BY
- `src/main.jsx (React app entry)` → `react.svg (React logo)`  [AMBIGUOUS]
  src/assets/react.svg · relation: USED_BY

## Knowledge Gaps
- **35 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Vite` and `react.svg (React logo)`?**
  _Edge tagged AMBIGUOUS (relation: SCAFFOLDED_BY) - confidence is low._
- **What is the exact relationship between `Vite` and `vite.svg (Vite logo)`?**
  _Edge tagged AMBIGUOUS (relation: SCAFFOLDED_BY) - confidence is low._
- **What is the exact relationship between `src/main.jsx (React app entry)` and `icons.svg (UI icon sprite sheet)`?**
  _Edge tagged AMBIGUOUS (relation: USED_BY) - confidence is low._
- **What is the exact relationship between `src/main.jsx (React app entry)` and `react.svg (React logo)`?**
  _Edge tagged AMBIGUOUS (relation: USED_BY) - confidence is low._
- **Why does `dependencies` connect `3D & Animation Dependencies` to `App Entry & Build Assets`, `Package Metadata & Scripts`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling Config` to `App Entry & Build Assets`, `Package Metadata & Scripts`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `react` connect `App Entry & Build Assets` to `3D & Animation Dependencies`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._