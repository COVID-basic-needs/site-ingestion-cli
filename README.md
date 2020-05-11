# food-site-updates for Hunger Free America et. al.

## An app for formatting and uploading Food Distribution Organization and Food-handout Site data dumps (i.e. `.CSV` & `.xlsx`) into the [National Free Food Data Collection Airtable](https://airtable.com/invite/l?inviteId=invgFbPkoS2sXfYoi&inviteToken=edaa3e00328ce2a8c0bf160c51210a071c06da6edb6b79e06773b6c1063bd325)

Join the conversation in our [Slack workspace](https://join.slack.com/t/covid-basic-needs)

To-do's are in https://trello.com/b/HqzmzBSE/covid-19-food-resources-collab


## Steps to get started:
1. Clone the repo.
1. Run `yarn install` to install dependencies.
1. Clone `example.env` as `.env` and populate the fields with your email and Airtable API key.
1. Check for a `.yaml` fieldMap for the file to upload in `fieldMaps/`, add the file to an existing one, or create a new one from the EXAMPLE.yaml
1. Run the CLI tool with `yarn start PATH_TO_YAML_FILEMAP`
