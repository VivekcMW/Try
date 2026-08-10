import type { Detox, DetoxCircusEnvironment, Element, Expect, MatchersFacade, NativeElement, WaitForFacade } from 'detox';
import type { ExpectElement } from 'detox/detox';

declare global {
  const device: Detox;
  function element(matcher: ReturnType<MatchersFacade[keyof MatchersFacade]>): Element;
  const by: MatchersFacade;
  function waitFor(element: Element): WaitForFacade;
  function expect(element: Element): ExpectElement;
  
  namespace NodeJS {
    interface Global {
      device: Detox;
      element: typeof element;
      by: MatchersFacade;
      waitFor: typeof waitFor;
      expect: typeof expect;
    }
  }
}

export {};
