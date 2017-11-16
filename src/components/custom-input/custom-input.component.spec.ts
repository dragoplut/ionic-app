import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';

/**
 * Load the implementations that should be tested.
 */
import { CustomInputComponent } from './custom-input.component';

describe(`Component: CustomInput `, () => {
  let comp: CustomInputComponent;
  let fixture: ComponentFixture<CustomInputComponent>;

  /**
   * async beforeEach.
   */
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [CustomInputComponent],
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
    fixture = TestBed.createComponent(CustomInputComponent);
    comp = fixture.componentInstance;

    /**
     * Trigger initial data binding.
     */
    fixture.detectChanges();
  });

  describe(`Checking statements: `, () => {
    it('should have empty itemClass', () => {
      expect(comp.itemClass).toEqual('');
    });

    it('should have empty itemLabel', () => {
      expect(comp.itemLabel).toEqual('');
    });

    it('should have empty itemError', () => {
      expect(comp.itemError).toEqual('');
    });

    it('should have empty itemValue', () => {
      expect(comp.itemValue).toEqual('');
    });

    it('should have empty itemType', () => {
      expect(comp.itemType).toEqual('');
    });

    it('should have empty itemDisabled', () => {
      expect(comp.itemDisabled).toEqual(true);
    });

    it('should have defined itemChange', () => {
      expect(comp.itemChange).toBeDefined();
    });
  });

  describe(`Checking functions: `, () => {
    it('should have valueChange function', () => {
      expect(typeof comp.valueChange).toEqual('function');
    });
  });

  describe(`test function invoke: `, () => {
    it('should invoke itemChange next event emitter on valueChange', () => {
      spyOn(comp.itemChange, 'next');
      let testVal: string = 'Test';
      comp.itemValue = testVal;
      comp.valueChange();
      expect(comp.itemChange.next).toHaveBeenCalledWith(testVal);
    });
  });
});
