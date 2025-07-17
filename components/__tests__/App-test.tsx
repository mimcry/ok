import * as React from 'react';
import renderer from 'react-test-renderer';

// Simple test to ensure the testing setup works
describe('App Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic string operations', () => {
    const testString = 'Hello World';
    expect(testString).toContain('Hello');
    expect(testString.length).toBe(11);
  });
}); 