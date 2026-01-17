import "@testing-library/jest-dom";

// Fix recharts / ResizeObserver crash
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = ResizeObserverMock;

// Fix DOM size issues
HTMLElement.prototype.getBoundingClientRect = () => ({
  width: 500,
  height: 300,
  top: 0,
  left: 0,
  bottom: 300,
  right: 500,
  x: 0,
  y: 0,
  toJSON: () => {},
});
