# Start Issue Development

## Input
$ARGUMENTS - GitHub issue number (e.g., "42" or "#42")

## Workflow

1. **Fetch issue details**
   - Run `gh issue view $ARGUMENTS` to get issue title, body, and acceptance criteria
   - Parse the issue number (e.g., "US-4.8") from the title for branch naming

2. **Prepare workspace**
   - Check `git status` for uncommitted changes - warn user if working directory is dirty
   - Fetch latest: `git fetch origin main`
   - Create branch following pattern: `feature/us-X.X-short-description`
   - Checkout the new branch

3. **Plan implementation**
   - Use TodoWrite to break down acceptance criteria into actionable tasks
   - Include test tasks for each feature

4. **Implement using specialized agents**
   - Use electron-pro for main process / IPC work
   - Use react-specialist for renderer components
   - Use sql-pro for Prisma schema / queries
   - Use context7 for up-to-date library documentation

5. **Validate**
   - Run `npm run test` - all tests must pass
   - Run `npm run build` - must compile without errors

6. **Summary**
   - List completed acceptance criteria
   - Note any blockers or follow-up items
