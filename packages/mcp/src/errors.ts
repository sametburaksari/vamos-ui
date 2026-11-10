/** A failure the agent can act on; the server returns it with isError: true. */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}
