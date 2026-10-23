---
name: consistently
description: Turn a task prompt into a saved, repeatable tool; rerun or repair that tool while preserving its recorded scope and success criteria. Use when the user wants a task remembered and performed consistently across runs.
---

# Consistently

Persist a task's contract and implementation, then execute that implementation on later runs. Consistency means stable selection rules, transformations, and success criteria for the same inputs and relevant environment. Changing inputs can produce changing outputs. Prompt-only tasks offer procedural consistency, not guaranteed identical model output; use deterministic code when exact results matter.

## Resolve the task

Interpret the request as create, run, inspect, repair, or explicitly revise a saved task. Inspect existing task records before inventing an implementation. Match by saved ID or unambiguous intent; clarify ambiguous matches. A request to discuss an idea or inspect a tool does not authorize executing it.

Store tasks in `.consistently/<task-id>/` within the active project by default. For tasks outside a project, establish one durable user-selected home; reuse a location already established in this conversation. Return its absolute path so future sessions can find it. Read [the record format](references/task-record.md) when creating or updating a task. Keep records and implementations self-contained; no sibling skill is required.

## Create

1. Inspect the relevant environment and resolve the prompt into a contract: target selection, exclusions, parameters and defaults, observable effects, and checkable success criteria. Record resolved paths and selection rules rather than leaving critical choices to future interpretation. Ask only about ambiguity that materially affects the outcome or authorization.
2. Save the contract before performing effects. Choose the smallest reliable implementation: a script for mechanical operations, a saved procedure for judgment-dependent work, or both. Record the exact entrypoint, working directory, dependencies, and environment assumptions. Pin or record versions where drift affects semantics. Keep credentials in the existing credential system, outside records.
3. Verify against disposable fixtures or a read-only preview when the real operation is destructive. Tests must check the contract independently of the implementation: include intended targets and nearby excluded targets. For cleanup, constrain resolved paths to the saved roots, define symlink behavior explicitly, and reject traversal or link escapes. A root disappearing is a failure or a recorded no-op according to the contract, never a reason to broaden the search.
4. Execute only when requested and authorized, using the saved entrypoint. Record observed results and limitations. Creating a repeatable tool alone does not authorize its first live run. Report the saved location, repeat invocation, and actual verification status.

## Run

Load the saved contract, implementation, and latest run/repair record. Validate parameters and relevant prerequisites, then reuse the entrypoint and defaults. A new parameter value must remain within the contract's permitted range. A requested scope or semantic change creates a revised contract; make that change explicit before effects.

Check postconditions and record success only when evidence supports them. Record partial effects, failures, and unknown outcomes accurately. Repeated execution must follow the saved repeat policy: distinguish idempotent operations from actions that append, send, charge, or otherwise repeat effects. Before retrying after interruption, reconcile completed work with the external state or saved checkpoints. Run one mutating invocation per task at a time; use an atomic lock or equivalent and preserve crash evidence before clearing a stale lock.

## Repair

Treat the saved contract and its acceptance checks as the repair boundary. Diagnose the failure and preserve the previous implementation. Repair only the machinery needed to restore the same behavior, such as an unavailable executable or changed API syntax. Keep target selection, exclusions, side effects, and success criteria fixed. Never weaken a check to make a repair pass.

Verify a candidate repair on fixtures or a preview before promoting it; retain the last verified revision. Record what changed, why it preserves the contract, and the evidence. Retry the live action only when its prior effects are reconciled and the original authorization still covers it. Limit a run to two repair candidates; stop earlier for ambiguous prior effects, missing access, or a required contract change. Save the failure and the decision needed rather than silently substituting a different result.

## Example

“Clean up my Xcode build folders” first establishes exactly which folders and contents are in scope, what is preserved, and how active builds are handled. Save those choices and a bounded cleanup tool. Later runs use those same roots and rules. A missing folder or changed Xcode installation never authorizes adding another cache directory. This example is a tool-building request, not an instruction to delete anything while creating this skill.
