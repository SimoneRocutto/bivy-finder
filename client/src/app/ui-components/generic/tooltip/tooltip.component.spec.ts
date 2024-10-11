import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TooltipComponent } from "./tooltip.component";
import { By } from "@angular/platform-browser";

const getElementStyle = (element: HTMLElement, pseudoElement?: string) =>
  window.getComputedStyle(element, pseudoElement);
/**
 * Gets the computed style of the ::before pseudoelement at this moment in time.
 * @param element Element which has the ::before pseudoelement.
 */
const getBefore = (element: HTMLElement) => getElementStyle(element, ":before");
/**
 * Gets the computed style of the ::after pseudoelement at this moment in time.
 * @param element Element which has the ::after pseudoelement.
 */
const getAfter = (element: HTMLElement) => getElementStyle(element, ":after");

// TODO Test hover events for opening and closing (I couldn't get it to work)
describe("TooltipComponent", () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  const sampleLabel = "prova label";
  let labelDiv: HTMLDivElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    component.label = sampleLabel;
    fixture.detectChanges();
    labelDiv = fixture.debugElement.query(
      By.css('[data-testid="tooltip"]')
    ).nativeElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders the tooltip with the label", () => {
    const style = getBefore(labelDiv);
    // Content also contains starting and ending quotes (""), so we slice them out.
    expect(style.content.slice(1, -1)).toBe(sampleLabel);
  });

  it("can be forced open", () => {
    component.forceOpen = true;
    fixture.detectChanges();
    const opacity = getBefore(labelDiv).opacity;
    expect(Number(opacity)).toBe(1);
  });

  it("can be disabled", () => {
    component.disabled = true;
    fixture.detectChanges();
    const opacity = getBefore(labelDiv).opacity;
    expect(Number(opacity)).toBe(0);
  });
});
