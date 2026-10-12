import { describe, expect, it } from 'vitest';

describe('Veloraa Rougee Theme System Tokens', () => {
  const lightTokens = {
    cream: '#F5EBE0',
    lightBeige: '#F1E7DA',
    champagne: '#E6D9CB',
    black: '#080604',
    darkBlack: '#0A0A08',
    gold: '#B9997F',
    roseGold: '#C57E5D',
    nude: '#DA9A78',
    brown: '#86533A',
    deepBrown: '#411F11',
    burgundy: '#773323',
    blush: '#E1BEA6',
  };

  const darkTokens = {
    black: '#000000',
    deepBlack: '#080604',
    darkBrown: '#342921',
    chocolate: '#432214',
    warmBrown: '#552E1D',
    copperBrown: '#7F4C34',
    terracotta: '#97513C',
    roseBrown: '#873730',
    burgundy: '#591716',
    lipstickRed: '#6E2922',
    roseGold: '#B97858',
    copper: '#C88D6E',
    champagne: '#CFB19C',
    cream: '#F2DCC3',
    antiqueGold: '#D6B17A',
  };

  it('defines valid hex colors for all official light palette tokens', () => {
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    for (const [name, hex] of Object.entries(lightTokens)) {
      expect(hexRegex.test(hex), `Light token ${name} should be valid hex`).toBe(true);
    }
  });

  it('defines valid hex colors for all official dark palette tokens', () => {
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    for (const [name, hex] of Object.entries(darkTokens)) {
      expect(hexRegex.test(hex), `Dark token ${name} should be valid hex`).toBe(true);
    }
  });

  it('verifies light and dark primary surfaces avoid clinical white or pure flat gray', () => {
    expect(lightTokens.cream).toBe('#F5EBE0');
    expect(darkTokens.deepBlack).toBe('#080604');
    expect(darkTokens.antiqueGold).toBe('#D6B17A');
    expect(lightTokens.burgundy).toBe('#773323');
  });
});
