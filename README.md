# GitHub action for issues automation for projects V2

Control [project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) tickets' lifecycle declaratively.

You will need to provide a token with permission to repo and handle projects.
You probably want to do it via github secrets.

## Example action
Issue relies on a token and a transition file.
### Example
```yml
name: Issue-Project automation

on: [issues]

jobs:
  transition-issues:
    runs-on: ubuntu-latest
    name: move issues
    steps:
      - name: Apply field transitions
        id: hello
        uses: reutsharabani/github-automaton@main
        with:
          token: ${{ secrets.GHPROJECT_TOKEN}}
          transitions: transitions.json
```

## Transitions File
Basically a json mapping from project-title -> event-type -> action-type -> target-field
### Example
```json
{
  "test 1": {
    "issues": {
      "opened": "Todo",
      "assigned": "In Progress",
      "unassigned": "Todo",
      "closed": "Done"
    }
  },
  "test 2": {
    "issues": {
      "opened": "Todo",
      "assigned": "In Progress",
      "unassigned": "Todo",
      "closed": "Done"
    }
  }
}
```
This is based on Alex Page's excellent [github-project-automation-plus](https://github.com/alex-page/github-project-automation-plus) but it's controlled via transition file.


# Possible extensions:

- More filters on transitions for fine-grained controls
- Support PR transitions
