/**
 * Color Tokens Tests
 * 
 * Tests to ensure color tokens are correctly defined and consistent.
 */

import { colors } from '../colors';

describe('Color Tokens', () => {
  describe('primary colors', () => {
    it('has correct primary DEFAULT color (Garageinn Red)', () => {
      expect(colors.primary.DEFAULT).toBe('#FF3D3D');
    });

    it('has white foreground for primary', () => {
      expect(colors.primary.foreground).toBe('#FFFFFF');
    });

    it('has complete primary color scale', () => {
      expect(colors.primary[50]).toBeDefined();
      expect(colors.primary[100]).toBeDefined();
      expect(colors.primary[200]).toBeDefined();
      expect(colors.primary[300]).toBeDefined();
      expect(colors.primary[400]).toBeDefined();
      expect(colors.primary[500]).toBeDefined();
      expect(colors.primary[600]).toBeDefined();
      expect(colors.primary[700]).toBeDefined();
      expect(colors.primary[800]).toBeDefined();
      expect(colors.primary[900]).toBeDefined();
    });

    it('has primary[500] matching DEFAULT', () => {
      expect(colors.primary[500]).toBe(colors.primary.DEFAULT);
    });
  });

  describe('semantic colors', () => {
    describe('success', () => {
      it('has correct success color', () => {
        expect(colors.success.DEFAULT).toBe('#22C55E');
      });

      it('has white foreground', () => {
        expect(colors.success.foreground).toBe('#FFFFFF');
      });

      it('has light and dark variants', () => {
        expect(colors.success.light).toBeDefined();
        expect(colors.success.dark).toBeDefined();
      });
    });

    describe('warning', () => {
      it('has correct warning color', () => {
        expect(colors.warning.DEFAULT).toBe('#F59E0B');
      });

      it('has white foreground', () => {
        expect(colors.warning.foreground).toBe('#FFFFFF');
      });

      it('has light and dark variants', () => {
        expect(colors.warning.light).toBeDefined();
        expect(colors.warning.dark).toBeDefined();
      });
    });

    describe('info', () => {
      it('has correct info color', () => {
        expect(colors.info.DEFAULT).toBe('#0EA5E9');
      });

      it('has white foreground', () => {
        expect(colors.info.foreground).toBe('#FFFFFF');
      });
    });

    describe('destructive', () => {
      it('has correct destructive color', () => {
        expect(colors.destructive.DEFAULT).toBe('#EF4444');
      });

      it('has white foreground', () => {
        expect(colors.destructive.foreground).toBe('#FFFFFF');
      });
    });
  });

  describe('surface colors - light mode', () => {
    it('has correct background color', () => {
      expect(colors.light.background).toBe('#FAFAFA');
    });

    it('has correct foreground color', () => {
      expect(colors.light.foreground).toBe('#1A1A1A');
    });

    it('has card colors defined', () => {
      expect(colors.light.card).toBe('#FFFFFF');
      expect(colors.light.cardForeground).toBe('#1A1A1A');
    });

    it('has muted colors defined', () => {
      expect(colors.light.muted).toBeDefined();
      expect(colors.light.mutedForeground).toBeDefined();
    });

    it('has border and input colors', () => {
      expect(colors.light.border).toBeDefined();
      expect(colors.light.input).toBeDefined();
    });

    it('has ring color matching primary', () => {
      expect(colors.light.ring).toBe(colors.primary.DEFAULT);
    });
  });

  describe('surface colors - dark mode', () => {
    it('has correct background color', () => {
      expect(colors.dark.background).toBe('#141414');
    });

    it('has correct foreground color', () => {
      expect(colors.dark.foreground).toBe('#FAFAFA');
    });

    it('has card colors defined', () => {
      expect(colors.dark.card).toBeDefined();
      expect(colors.dark.cardForeground).toBeDefined();
    });

    it('has muted colors defined', () => {
      expect(colors.dark.muted).toBeDefined();
      expect(colors.dark.mutedForeground).toBeDefined();
    });

    it('has ring color matching primary', () => {
      expect(colors.dark.ring).toBe(colors.primary.DEFAULT);
    });
  });

  describe('neutral colors', () => {
    it('has white and black', () => {
      expect(colors.neutral.white).toBe('#FFFFFF');
      expect(colors.neutral.black).toBe('#000000');
    });

    it('has transparent', () => {
      expect(colors.neutral.transparent).toBe('transparent');
    });

    it('has complete neutral scale', () => {
      expect(colors.neutral[50]).toBeDefined();
      expect(colors.neutral[100]).toBeDefined();
      expect(colors.neutral[200]).toBeDefined();
      expect(colors.neutral[300]).toBeDefined();
      expect(colors.neutral[400]).toBeDefined();
      expect(colors.neutral[500]).toBeDefined();
      expect(colors.neutral[600]).toBeDefined();
      expect(colors.neutral[700]).toBeDefined();
      expect(colors.neutral[800]).toBeDefined();
      expect(colors.neutral[900]).toBeDefined();
    });
  });

  describe('color format validation', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    it('primary colors are valid hex', () => {
      expect(colors.primary.DEFAULT).toMatch(hexColorRegex);
      expect(colors.primary.foreground).toMatch(hexColorRegex);
    });

    it('semantic colors are valid hex', () => {
      expect(colors.success.DEFAULT).toMatch(hexColorRegex);
      expect(colors.warning.DEFAULT).toMatch(hexColorRegex);
      expect(colors.info.DEFAULT).toMatch(hexColorRegex);
      expect(colors.destructive.DEFAULT).toMatch(hexColorRegex);
    });

    it('light mode colors are valid hex', () => {
      expect(colors.light.background).toMatch(hexColorRegex);
      expect(colors.light.foreground).toMatch(hexColorRegex);
      expect(colors.light.card).toMatch(hexColorRegex);
    });

    it('dark mode colors are valid hex', () => {
      expect(colors.dark.background).toMatch(hexColorRegex);
      expect(colors.dark.foreground).toMatch(hexColorRegex);
      expect(colors.dark.card).toMatch(hexColorRegex);
    });
  });

  describe('contrast requirements', () => {
    // Basic check that foreground/background are different
    it('light mode has contrast between background and foreground', () => {
      expect(colors.light.background).not.toBe(colors.light.foreground);
    });

    it('dark mode has contrast between background and foreground', () => {
      expect(colors.dark.background).not.toBe(colors.dark.foreground);
    });

    it('primary has contrast with foreground', () => {
      expect(colors.primary.DEFAULT).not.toBe(colors.primary.foreground);
    });
  });
});

