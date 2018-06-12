import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

/**
 * Load the implementations that should be tested.
 */
import { CustomProgressBarComponent } from './custom-progress-bar.component';

describe(`Component: CustomProgressBar `, () => {
  let comp: CustomProgressBarComponent;
  let fixture: ComponentFixture<CustomProgressBarComponent>;

  /**
   * async beforeEach.
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [CustomProgressBarComponent],
        schemas: [NO_ERRORS_SCHEMA]
      })
      /**
       * Compile template and css.
       */
      .compileComponents();
  }));

  /**
   * Synchronous beforeEach.
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(CustomProgressBarComponent);
    comp = fixture.componentInstance;

    /**
     * Trigger initial data binding.
     */
    fixture.detectChanges();
  });

  describe(`Checking statements: `, () => {
    it('should have itemValue equal to 0', () => {
      expect(comp.itemValue).toEqual(0);
    });

    it('should have empty itemClass', () => {
      expect(comp.itemClass).toEqual('');
    });

    it('should have empty itemError', () => {
      expect(comp.itemError).toEqual('');
    });
  });
});
