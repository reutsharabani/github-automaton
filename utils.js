const github = require("@actions/github");
const core = require("@actions/core");
const token = core.getInput("token");
const octokit = github.getOctokit(token);

async function updateStatusByIssueId(projectTitle, issueId, targetStatus) {
    console.log(projectTitle, issueId, targetStatus);
    const response = await octokit.graphql(
        `query {
            node(id: "${issueId}") {
              ... on Issue {
                  id
                  projectItems(first: 100) {
                    nodes {
                      id
                      project {
                        id,
                        title
                        fields(first: 100) {
                          nodes {
                            ... on ProjectV2SingleSelectField {
                              id,
                              name,
                              options {
                                 id,
                                 name
                              }
                            }
                          }
                        }
                      }
                      fieldValueByName(name:"Status") {
                        ... on ProjectV2ItemFieldSingleSelectValue {
                          id,
                          name
                        }
                      }
                    }
                  }
                }
            }

        }`
    );
    console.log(JSON.stringify(response));
    const projectItems = response?.node?.projectItems?.nodes.filter(n => n?.project?.title === projectTitle);
    if (projectItems.length === 0) {
        console.log("no project items found");
        return {};
    }
    const item = projectItems[0];
    const projectId = item.project?.id;
    core.debug(`found projectId: ${projectId}`);
    const projectField = item.project?.fields.nodes.find(n => n.name === "Status");
    const targetStatusSelectionId = projectField.options.find(o => o.name === targetStatus).id;
    core.debug(`found targetStatusSelectionId: ${targetStatusSelectionId}`);
    const itemId = item?.id;
    core.debug(`found itemId: ${itemId}`);
    const fieldId = projectField.id;
    core.debug(`found fieldId: ${fieldId}`);
    const fieldStatus = item?.fieldValueByName?.name;
    if (fieldStatus === targetStatus) {
      core.info("ticket already in correct status, skipping");
      return
    }
    core.info(`changing fieldStatus: ${fieldStatus} -> ${targetStatus}`);
    const m = await octokit.graphql(
         `mutation {
                 updateProjectV2ItemFieldValue(
                     input: {
                         projectId: "${projectId}",
                         itemId: "${itemId}",
                         fieldId: "${fieldId}",
                         value: { 
                             singleSelectOptionId: "${targetStatusSelectionId}"        
                         }
                     }
                     ) {
                     projectV2Item {
                         id
               }
            }
         }`
     )
    return m
}

module.exports = { updateStatusByIssueId };