Another TODO app, but this one is mine.

### Distinguishing features

- Tasks repeat following a designated interval after last completion
    - E.g. "Change HVAC filter" repeats 3 months after last completion
- (TODO) Tasks can be hidden by Home Assistant contexts
  - E.g. "Change sensor battery" 
    - only appears when I'm home and the battery is low
    - This is not a task to click "complete" on, it should hide automatically when the battery is changed
- (TODO) Tasks shown only on approriate devices
    - E.g. "Take out the trash" only appears on the kitchen tablet
    - E.g. "Test the backups" only appears on the desktop computer
- (TODO) Prioritization
    - Tasks belong to projects
    - Projects are prioritized, affecting priority of tasks

### TODO

- CouchDB design docs to source control
- Cypress tests
- Deployment
  - Docker Compose for CouchDB
  - Update check
- Use Home Assistant tasks? Deployment within Home Assistant
