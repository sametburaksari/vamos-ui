import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { FeedbackPrompt } from "./feedback-prompt";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const reasons = [
  { value: "unclear", label: "Hard to follow" },
  { value: "outdated", label: "Out of date" },
];

describe("FeedbackPrompt", () => {
  it("asks the question as a labelled section", async () => {
    renderWithProviders(<FeedbackPrompt />);
    expect(screen.getByRole("region", { name: "Was this helpful?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Was this helpful?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("aria-pressed", "false");
    await expectNoA11yViolations();
  });

  it("yes submits at once and thanks in a live region", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<FeedbackPrompt onSubmit={onSubmit} thanksDetail="It helps us improve the page." />);
    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onSubmit).toHaveBeenCalledWith({ helpful: true, reasons: [], comment: "" });
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks for your feedback.It helps us improve the page.");
    expect(screen.queryByRole("button", { name: "Yes" })).not.toBeInTheDocument();
  });

  it("no opens the follow-up with reasons and a comment", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<FeedbackPrompt reasons={reasons} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "No" }));
    const form = screen.getByRole("form", { name: "What could be better?" });
    expect(form).toBeInTheDocument();
    const send = screen.getByRole("button", { name: "Send feedback" });
    expect(send).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Out of date" }));
    await user.type(screen.getByLabelText(/Anything else/), "  The screenshots show the old menu.  ");
    expect(send).toBeEnabled();
    await expectNoA11yViolations();
    await user.click(send);
    expect(onSubmit).toHaveBeenCalledWith({ helpful: false, reasons: ["outdated"], comment: "The screenshots show the old menu." });
    expect(await screen.findByText("Thanks for your feedback.")).toBeInTheDocument();
  });

  it("skip still records the vote", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<FeedbackPrompt onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "No" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSubmit).toHaveBeenCalledWith({ helpful: false, reasons: [], comment: "" });
  });

  it("followUp=both asks after yes too; never submits straight away", async () => {
    const onSubmit = vi.fn();
    const { user, unmount } = renderWithProviders(<FeedbackPrompt followUp="both" yesReasons={[{ value: "examples", label: "The examples" }]} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(screen.getByRole("form", { name: "What helped?" })).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
    const r = renderWithProviders(<FeedbackPrompt followUp="never" onSubmit={onSubmit} />);
    await r.user.click(screen.getByRole("button", { name: "No" }));
    expect(onSubmit).toHaveBeenCalledWith({ helpful: false, reasons: [], comment: "" });
  });

  it("shows an error and allows a retry when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    const { user } = renderWithProviders(<FeedbackPrompt onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "No" }));
    await user.type(screen.getByLabelText(/Anything else/), "Typo in step 2");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(await screen.findByText("Couldn’t send your feedback. Try again.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText("Thanks for your feedback.")).toBeInTheDocument());
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("takes labels and a heading level", () => {
    renderWithProviders(<FeedbackPrompt headingLevel={3} labels={{ question: "Bu sayfa işinize yaradı mı?", yes: "Evet", no: "Hayır" }} />, { locale: "tr-TR" });
    expect(screen.getByRole("heading", { level: 3, name: "Bu sayfa işinize yaradı mı?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evet" })).toBeInTheDocument();
  });
});
