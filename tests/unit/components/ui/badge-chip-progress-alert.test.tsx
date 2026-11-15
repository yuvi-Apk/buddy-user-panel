// Badge, TopicChip, ProgressBar and Alert: never color alone.
import { render, screen } from "@testing-library/react";
import { Check } from "lucide-react";
import { describe, expect, it } from "vitest";
import { fill, getLang } from "@/lang";
import { Alert, Badge, ProgressBar, TopicChip } from "@/components/ui";

const { ui } = getLang();

describe("Badge", () => {
  it("shows its word, with the icon hidden from screen readers", () => {
    const { container } = render(
      <Badge tone="progress" icon={<Check />}>
        Done
      </Badge>
    );
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(
      container.querySelector("svg")?.closest("[aria-hidden]")
    ).not.toBeNull();
  });
});

describe("TopicChip", () => {
  it("says in words how the student is doing with the topic", () => {
    render(
      <>
        <TopicChip name="Algebra" strength="strong" />
        <TopicChip name="Optics" strength="needs-practice" />
      </>
    );
    expect(screen.getByText("Algebra").parentElement).toHaveTextContent(
      ui.topicStrong
    );
    expect(screen.getByText("Optics").parentElement).toHaveTextContent(
      ui.topicNeedsPractice
    );
  });
});

describe("ProgressBar", () => {
  it("is a progress bar named by its label, with the percentage as text", () => {
    render(<ProgressBar label="This week" value={4} max={7} />);
    const bar = screen.getByRole("progressbar", { name: "This week" });
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuemax", "7");
    expect(
      screen.getByText(fill(ui.percent, { value: 57 }))
    ).toBeInTheDocument();
  });

  it("keeps the value between 0 and max", () => {
    render(
      <>
        <ProgressBar label="Too much" value={12} max={10} />
        <ProgressBar label="Too little" value={-3} max={10} />
        <ProgressBar label="Nothing planned" value={0} max={0} />
      </>
    );
    expect(
      screen.getByRole("progressbar", { name: "Too much" })
    ).toHaveAttribute("aria-valuenow", "10");
    expect(
      screen.getByRole("progressbar", { name: "Too little" })
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getAllByText(fill(ui.percent, { value: 0 }))).toHaveLength(2);
  });
});

describe("Alert", () => {
  it("announces an error at once, and other messages politely", () => {
    render(
      <>
        <Alert tone="destructive" title="Couldn't save" />
        <Alert tone="success" title="Saved" />
      </>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save");
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });
});
