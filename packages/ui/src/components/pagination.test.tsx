import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { CursorPagination, Pagination, PaginationBar, paginationRange } from "./pagination";

describe("paginationRange", () => {
  it("keeps a constant length with ellipses", () => {
    expect(paginationRange({ page: 1, pageCount: 5 })).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange({ page: 1, pageCount: 20 })).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
    expect(paginationRange({ page: 6, pageCount: 20 })).toEqual([1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20]);
    expect(paginationRange({ page: 20, pageCount: 20 })).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
    expect(paginationRange({ page: 3, pageCount: 0 })).toEqual([]);
  });
});

describe("Pagination", () => {
  it("renders a labelled nav with the current page", async () => {
    const { container } = render(<Pagination page={6} pageCount={20} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("calls onPageChange and disables arrows at the edges", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={12} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange.mock.calls).toEqual([[2], [3]]);
  });

  it("renders real links with getHref", () => {
    render(<Pagination page={2} pageCount={4} getHref={(p) => `/blog?page=${p}`} />);
    expect(screen.getByRole("link", { name: "Page 3" })).toHaveAttribute("href", "/blog?page=3");
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute("href", "/blog?page=1");
  });

  it("hides on a single page", () => {
    const { container } = render(<Pagination page={1} pageCount={1} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("PaginationBar", () => {
  it("shows the range and changes page size", async () => {
    const onPageSizeChange = vi.fn();
    const onPageChange = vi.fn();
    const { container } = render(<PaginationBar total={1284} page={3} pageSize={20} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />);
    expect(screen.getByText("41–60 of 1,284")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Rows per page"), "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CursorPagination", () => {
  it("disables by hasPrev / hasNext", async () => {
    const onNext = vi.fn();
    render(<CursorPagination hasPrev={false} hasNext onNext={onNext} />);
    expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(onNext).toHaveBeenCalled();
  });
});
