# Required secret scan

`enterprise-secret-scan.yml` is a standalone workflow for an organization ruleset. It scans the repository receiving the pull request or merge-group event. It does not replace the existing reusable `gitleaks.yml`, and it does not execute application code.

## Scan contract

The job uses a standard Ubuntu runner, read-only repository permission, checkout without persisted credentials, and Gitleaks CLI 8.30.1. Checkout is pinned to the v4.3.1 commit. The Linux archive is checked against its published SHA256 before extraction:

```text
551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb
```

The scan covers all history reachable from the checked-out event commit, including deleted historical secrets and changes introduced only by merge commits (`git log -m`). It is not restricted to changed lines or unrelated branches. Findings are fully redacted in logs. A finding, invalid policy, download/checksum error, missing base commit, or execution timeout fails the job. There is no report-only switch, paid Gitleaks Action, deployment credential, or application dependency installation. Standard Actions usage and the repository owner's allowances still apply.

Repository-specific `.gitleaks.toml` and `.gitleaksignore` are read from the event's approved base SHA, never from proposed changes. With no base configuration, an explicit configuration enables Gitleaks' built-in rules. Configuration files must be regular files. File-based `[extend].path` is unsupported because it could resolve to untrusted checkout content; use built-in defaults or inline rules. The history is scanned in a local clone without working files: Gitleaks otherwise also discovers a proposed `.gitleaksignore` even when an explicit ignore path is supplied. Existing approved allowlists remain effective. Inline `gitleaks:allow` comments are ignored by this workflow.

Changes to scan exceptions therefore take effect only after approval and merge into the base branch. Do not add broad exceptions just to turn a required check green. Rotate real credentials and resolve their exposure; document and review narrowly scoped exceptions for confirmed synthetic fixtures. Historical findings can require remediation before enabling enforcement.

## Pilot rollout

1. Merge the workflow into the source repository and record its commit.
2. Configure an organization ruleset targeting only the selected pilot repositories and their protected default branches. Add **Require workflows to pass before merging**, selecting this source repository, `.github/workflows/enterprise-secret-scan.yml`, and the reviewed source revision.
3. Begin in **Evaluate**. Open or refresh a pilot pull request and verify that the scan checks the target repository. Confirm the expected redacted failure on a synthetic fixture in a disposable test branch, then remove the fixture. Test a merge-group run before enforcing a merge queue.
4. Change the pilot ruleset to **Active** only after baseline findings are resolved and real workflow runs pass. Broader rollout is a separate decision.

GitHub supports `pull_request` and `merge_group` for this rule. The explicit job condition enables cross-repository execution. Event filters are ignored by ruleset workflows; the ruleset controls repository and branch scope. This workflow intentionally has no concurrency cancellation. A pull request that predates the ruleset may need a new commit, branch update, or close/reopen before its required run appears.

Source visibility must permit the selected targets: a public source can serve any repository visibility in the organization. An internal or private source additionally needs the relevant cross-repository Actions access setting.

## Rollback

For a pilot that blocks merges unexpectedly, restore the saved ruleset or return only this pilot rule to **Evaluate** while investigating. This relaxes this protection and should be recorded. Do not delete the workflow while an active rule still references it, and do not change unrelated branch protections. A scanner regression can be reverted in the source repository or rolled back to the previously reviewed workflow revision, followed by a fresh target-repository run.

## Upgrades and verification

Update the version, published archive digest, and checkout commit together with reviewable source links. Verify the downloaded archive against the published checksum and run positive and negative scanner fixtures, including history-only findings, invalid configuration, and attempts to suppress a finding through PR-controlled configuration or ignore files. Run `actionlint -ignore 'constant expression "true" in condition' .github/workflows/enterprise-secret-scan.yml`. The narrow exception preserves the explicit condition required for cross-repository ruleset execution. Local validation is not proof of cross-repository or merge-queue execution; retain actual pilot run links before enforcing the rule.

- [Gitleaks release and archive checksums](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1)
- [Gitleaks configuration and CLI](https://github.com/gitleaks/gitleaks/blob/v8.30.1/README.md)
- [Pinned checkout release](https://github.com/actions/checkout/releases/tag/v4.3.1)
- [Ruleset workflow requirements](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-workflows-to-pass-before-merging)
- [Ruleset workflow troubleshooting](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules#troubleshooting-ruleset-workflows)
