// Stands in for a CLI library entry that is not built yet, so the dynamic import fails at
// runtime (as it would in a real install) instead of failing the test transform.
throw new Error("module not built yet (packages/cli source missing)");
