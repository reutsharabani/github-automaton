const fs = require("fs");
const utils = require("./utils.js");
const core = require("@actions/core");
const github = require("@actions/github");

console.log(`running job: ${github.context}`);
(async () => {
  try {
    const transitions_file = __dirname + "/" + core.getInput("transitions");
    console.log(`Transitions file: ${transitions_file}`);
    const context = github.context;
    const triggerEventName = context.eventName;
    core.debug(`Event name: ${triggerEventName}`);
    const triggerActionName = context.payload.action;
    core.debug(`Action name: ${triggerActionName}`);
    const contextString = JSON.stringify(context, undefined, 2);
    core.debug(`The context: ${contextString}`);
    const issueNodeId = context.payload.issue.node_id;
    core.debug(`issueNodeId: ${issueNodeId}`);
    const data = fs.readFileSync(transitions_file, "utf8");
    const transitions = JSON.parse(data);
    Object.entries(transitions).map(([projectTitle, eas]) => {
      try {
        core.startGroup(`processing project ${projectTitle}`);
        Object.entries(eas).map(([eventName, as]) => {
          Object.entries(as).map(([actionName, statusName]) => {
            if (eventName === triggerEventName && triggerActionName === actionName) {
              core.info(`trying to move issue on ${projectTitle} to ${statusName}`);
              utils.updateStatusByIssueId(projectTitle, issueNodeId, statusName).finally(core.endGroup);
            } else {
              core.debug(`skipping`);
              core.debug({ projectTitle, eventName, actionName, statusName });
            }
          })
        })
      } finally {
        core.endGroup();
      }
    })
    core.info("job done");
  } catch (error) {
    core.error(error.message);
    core.setFailed(error.message);
  }
})();
