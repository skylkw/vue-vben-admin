import { reactive, watch } from 'vue';

import { preferences, usePreferences } from '@vben/preferences';

/**
 * 用于适配各个框架的设计系统
 */

export function useAntdDesignTokens() {
  const rootStyles = getComputedStyle(document.documentElement);

  const tokens = reactive({
    borderRadius: '' as any,
    colorBgBase: '',
    colorBgContainer: '',
    colorBgElevated: '',
    colorBgLayout: '',
    colorBgMask: '',
    colorBorder: '',
    colorBorderSecondary: '',
    colorError: '',
    colorInfo: '',
    colorPrimary: '',
    colorSuccess: '',
    colorTextBase: '',
    colorWarning: '',
  });

  const getCssVariableValue = (variable: string, isColor: boolean = true) => {
    const value = rootStyles.getPropertyValue(variable);
    return isColor ? `hsl(${value})` : value;
  };

  watch(
    () => preferences.theme,
    () => {
      tokens.colorPrimary = getCssVariableValue('--primary');

      tokens.colorInfo = getCssVariableValue('--primary');

      tokens.colorError = getCssVariableValue('--destructive');

      tokens.colorWarning = getCssVariableValue('--warning');

      tokens.colorSuccess = getCssVariableValue('--success');

      tokens.colorTextBase = getCssVariableValue('--foreground');

      getCssVariableValue('--primary-foreground');

      tokens.colorBorderSecondary = tokens.colorBorder =
        getCssVariableValue('--border');

      tokens.colorBgElevated = getCssVariableValue('--popover');

      tokens.colorBgContainer = getCssVariableValue('--card');

      tokens.colorBgBase = getCssVariableValue('--background');

      const radius = Number.parseFloat(getCssVariableValue('--radius', false));
      // 1rem = 16px
      tokens.borderRadius = radius * 16;

      tokens.colorBgLayout = getCssVariableValue('--background-deep');
      tokens.colorBgMask = getCssVariableValue('--overlay');
    },
    { immediate: true },
  );

  return {
    tokens,
  };
}


