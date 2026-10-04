# CultureQuest — Developer & Agent Guide (agent.md)

Please refer to [AGENTS.md](file:///c:/Users/himan/OneDrive/Desktop/Web%20Development/Main%20Challenge/AGENTS.md) for full architectural guidelines, database schemas, script references, and image pipeline instructions.

### Quick Summary
- **Real Image Pipeline**: 100% genuine real landmark photographs fetched via Wikipedia REST API (`https://en.wikipedia.org/api/rest_v1/page/summary/{landmark}`) and uploaded to Cloudinary (`culturequest/destinations/{slug}/gallery/`).
- **No AI / Placeholders**: Real photos only for all destinations, galleries, and events.
- **Dynamic Search Flow**: Integrated in `backend/controllers/destinationController.js`.
- **Audit Script**: `node backend/scripts/audit_and_enforce_all.js`.
