### Features

- Tasks repeat following a designated interval after last completion
    - E.g. "Change HVAC filter" repeats 3 months after last completion
- (TODO) Tasks show according to context
  - Home Assistant, E.g. "Change sensor battery" 
    - only appears when I'm home and the battery is low
    - This is not a task to click "complete" on, it should hide automatically when the battery is changed
  - Device context
    - E.g. "Take out the trash" only appears on the kitchen tablet
    - E.g. "Test the backups" only appears on the desktop computer
- (TODO) Prioritization
    - Tasks belong to projects
    - Projects are prioritized, affecting priority of tasks
- (TODO) Households
    - Tasks may be shared among household members

### TODO

- Cypress tests
- Deployment
  - Docker Compose for CouchDB
  - Automatic design documents
  - Update check
- Development instructions
- Use Home Assistant tasks? Deployment within Home Assistant
