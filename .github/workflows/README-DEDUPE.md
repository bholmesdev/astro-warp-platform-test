# Duplicate Issue Detection Workflow

This workflow uses [Warp's Oz cloud agents](https://docs.warp.dev/platform) to automatically detect duplicate issues when new issues are opened.

## How It Works

1. **Trigger**: Runs automatically when a new issue is opened
2. **Agent Task**: Launches an Oz cloud agent that:
   - Uses GitHub CLI (`gh`) to search for similar issues
   - Analyzes issue titles, descriptions, and error messages
   - Identifies actual duplicate issues (not just similar ones)
   - Posts a comment directly if high-confidence duplicates are found
3. **Output**: Simple comment format: "This is potentially a duplicate of #1234, #5678, and #9012."

## Setup Requirements

### 1. Warp API Key

Generate a Warp API key:
1. Go to [Warp Platform Settings](https://app.warp.dev/settings/platform)
2. Generate a new API key
3. Add it to GitHub repository secrets as `WARP_API_KEY`

### 2. Agent Environment (Optional)

For better performance, create a Warp environment with GitHub CLI pre-installed:

```bash
warp-dev environment create \
  --name "astro-dedupe" \
  --image "ghcr.io/warpdotdev/warp-environments:ubuntu-gh-cli" \
  --repos "https://github.com/withastro/astro"
```

Then set the environment ID as a repository variable `WARP_AGENT_PROFILE`.

### 3. GitHub Token

The workflow uses the automatic `GITHUB_TOKEN` provided by GitHub Actions. No additional setup needed.

## Configuration

### Adjust Repository Check

Update line 10 in `issue-dedupe.yml`:
```yaml
if: github.repository == 'withastro/astro'
```

Change `'withastro/astro'` to your repository name.

### Customize Prompt

You can modify the agent prompt (lines 22-57) to:
- Adjust search strategies
- Change confidence thresholds
- Modify comment format
- Add repository-specific context

### Disable on Certain Issues

Add conditions to skip certain issues:
```yaml
if: github.repository == 'withastro/astro' && !contains(github.event.issue.labels.*.name, 'no-dedupe')
```

## Example Output

When duplicates are found, the agent comments:

> This is potentially a duplicate of #1234, #5678, and #9012.

Or for a single duplicate:

> This is potentially a duplicate of #1234.

## Costs

Each agent run uses Warp platform credits. Monitor usage at [Warp Platform Dashboard](https://app.warp.dev/platform).

## Troubleshooting

### Agent doesn't find duplicates
- Check that `gh` CLI has access to the repository
- Ensure GITHUB_TOKEN has `issues: read` permissions
- Review agent session logs in Warp dashboard

### No comment posted
- Agent may not have found high-confidence duplicates
- Check agent session logs in Warp dashboard for what it found
- Verify `issues: write` permission in workflow
- Ensure GITHUB_TOKEN is passed correctly to agent

### Rate limiting
- Add delays between issue creation and agent triggering
- Consider batching duplicate checks instead of per-issue

## Related

- [Warp Platform Documentation](https://docs.warp.dev/platform)
- [GitHub Actions - Warp Agent Action](https://github.com/warpdotdev/warp-agent-action)
