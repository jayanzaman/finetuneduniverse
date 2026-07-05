import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react';

// vi.mock is hoisted above module-scope const initializers, so the fake must
// be created inside vi.hoisted() — a plain `const fake = …` would throw
// "Cannot access 'fake' before initialization" when the factory runs.
const fake = vi.hoisted(() => {
  type State = { enabled: boolean; loading: boolean };
  const listeners = new Set<() => void>();
  const f = {
    state: { enabled: false, loading: false } as State,
    listeners,
    getState: () => f.state,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    setState(next: State) {
      f.state = next;
      listeners.forEach((l) => l());
    },
    enable: vi.fn(async () => {}),
    disable: vi.fn(),
  };
  return f;
});

vi.mock('./director', () => ({ audioDirector: fake }));
import { SoundToggle } from './SoundToggle';

beforeEach(() => {
  fake.state = { enabled: false, loading: false };
  fake.listeners.clear();
  vi.mocked(fake.enable).mockClear();
  vi.mocked(fake.disable).mockClear();
});

afterEach(() => {
  cleanup();
});

describe('SoundToggle', () => {
  it('renders off by default and enables on click', () => {
    render(<SoundToggle />);
    const btn = screen.getByRole('button', { name: /sound · off/i });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    act(() => btn.click());
    expect(fake.enable).toHaveBeenCalledTimes(1);
  });

  it('reflects the enabled state and disables on click', () => {
    render(<SoundToggle />);
    act(() => fake.setState({ enabled: true, loading: false }));
    const btn = screen.getByRole('button', { name: /sound · on/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    act(() => btn.click());
    expect(fake.disable).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', () => {
    render(<SoundToggle />);
    act(() => fake.setState({ enabled: false, loading: true }));
    const btn = screen.getByRole('button', { name: /sound/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
