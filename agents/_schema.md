---
# Agent Schema — copy this file to create a new agent
name: ""                  # unique slug, matches filename
role: ""                  # one-line description of the agent's single concern
model: ""                 # override model, or leave blank to use atlas.yaml default
tools:                    # tools this agent may use
  - Read
  - Write
input_schema: ""          # expected input format (free text / JSON schema ref)
output_schema: ""         # expected output format
---

## System Prompt

<!-- Write the agent's system prompt here. Be specific and single-purpose. -->

## Capabilities

<!-- Bullet list of what this agent can do -->

## Constraints

<!-- Bullet list of what this agent must NOT do -->

## Example Input

<!-- Short example of a valid input -->

## Example Output

<!-- Short example of a valid output -->
