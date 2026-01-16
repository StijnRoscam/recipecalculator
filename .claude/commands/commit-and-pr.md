Commit all current changes and create a pull request.

Steps:
1. Run `git status` and `git diff` to see all changes
2. Run `git log --oneline -5` to understand recent commit message style
3. Stage all relevant changes (exclude files with secrets like .env)
4. Create a commit with a descriptive message following the repository's conventional commit style (feat/fix/refactor/test/docs)
5. Push the branch to origin with `-u` flag
6. Create a PR using `gh pr create` targeting the main branch
7. Include in the PR body:
   - Summary of changes (bullet points)
   - Acceptance criteria checklist if applicable
   - Test plan with manual testing steps
8. Return the PR URL when complete

Notes:
- Follow branch naming convention from CLAUDE.md: `feature/us-X.X-description`
- Commit message should focus on "why" not "what"
- End commit message with the Claude Code signature
