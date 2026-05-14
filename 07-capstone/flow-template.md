# Capstone Flow Template

Use this for your required independent flow.

Replace the heading with the real flow name.

## Flow: <name>

## Summary (one paragraph)

- What is the purpose of this flow?
- Where does it begin?
- What other subsystem(s) does it cross?
- What counts as success?

## Numbered Step Trace (with file references)

1. Entry point — `<file>`
2. 
3. 
4. 

Write enough steps that another reader could reconstruct the flow from source.

## Sequence Diagram (text form)

```text
Caller → ...
```

## Invariants This Flow Protects

- 
- 
- 

## Stable vs Current vs Policy vs Evolving

- **Structurally stable** —
- **Current implementation** —
- **Policy-driven** —
- **Evolving** —

## Final Check

Before calling the flow write-up done, ask:

- Did I identify the primary owning layer at each major hand-off?
- Did I distinguish event order from persisted order where relevant?
- Did I separate structural invariants from current implementation details?
- If this flow changed, do I know which package I would inspect first?
