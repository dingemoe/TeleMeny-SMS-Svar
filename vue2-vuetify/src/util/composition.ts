import {
  composePaths,
  findUISchema,
  getFirstPrimitiveProp,
  isDescriptionHidden,
  Resolve,
  computeLabel,
  UISchemaElement,
} from '@jsonforms/core';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { computed, ref, ComputedRef } from '../vue';
import { useStyles } from '../styles';

const useChildUiSchema = <I extends { control: any }>(
  input: I
): ComputedRef<UISchemaElement> => {
  return computed(() =>
    findUISchema(
      input.control.value.uischemas,
      input.control.value.schema,
      input.control.value.uischema.scope,
      input.control.value.path
    )
  );
};

const useControlAppliedOptions = <I extends { control: any }>(input: I) => {
  return computed(() =>
    merge(
      {},
      cloneDeep(input.control.value.config),
      cloneDeep(input.control.value.uischema.options)
    )
  );
};

const useComputedLabel = <I extends { control: any }>(
  input: I,
  appliedOptions: ComputedRef<any>
) => {
  return computed((): string => {
    return computeLabel(
      input.control.value.label,
      input.control.value.required,
      !!appliedOptions.value?.hideRequiredAsterisk
    );
  });
};

/**
 * Adds styles, isFocused, appliedOptions and onChange
 */
export const useVuetifyControl = <
  I extends { control: any; handleChange: any }
>(
  input: I,
  adaptValue: (target: any) => any = (v) => v
) => {
  const appliedOptions = useControlAppliedOptions(input);

  const isFocused = ref(false);
  const onChange = (value: any) => {
    input.handleChange(input.control.value.path, adaptValue(value));
  };

  const persistentHint = (): boolean => {
    return !isDescriptionHidden(
      input.control.value.visible,
      input.control.value.description,
      isFocused.value,
      !!appliedOptions.value?.showUnfocusedDescription
    );
  };

  const computedLabel = useComputedLabel(input, appliedOptions);

  const controlWrapper = computed(() => {
    const { id, description, errors, label, visible, required } =
      input.control.value;
    return { id, description, errors, label, visible, required };
  });

  const styles = useStyles(input.control.value.uischema);

  return {
    ...input,
    styles,
    isFocused,
    appliedOptions,
    controlWrapper,
    onChange,
    persistentHint,
    computedLabel,
  };
};

/**
 * Adds styles and appliedOptions
 */
export const useVuetifyLayout = <I extends { layout: any }>(input: I) => {
  const appliedOptions = computed(() =>
    merge(
      {},
      cloneDeep(input.layout.value.config),
      cloneDeep(input.layout.value.uischema.options)
    )
  );
  return {
    ...input,
    styles: useStyles(input.layout.value.uischema),
    appliedOptions,
  };
};

/**
 * Adds styles, appliedOptions and childUiSchema
 */
export const useVuetifyArrayControl = <I extends { control: any }>(
  input: I
) => {
  const appliedOptions = useControlAppliedOptions(input);

  const childUiSchema = useChildUiSchema(input);

  const computedLabel = useComputedLabel(input, appliedOptions);

  const childLabelForIndex = (index: number) => {
    const childLabelProp =
      input.control.value.uischema.options?.childLabelProp ??
      getFirstPrimitiveProp(input.control.value.schema);
    if (!childLabelProp) {
      return `${index}`;
    }
    const labelValue = Resolve.data(
      input.control.value.data,
      composePaths(`${index}`, childLabelProp)
    );
    if (labelValue === undefined || labelValue === null || isNaN(labelValue)) {
      return '';
    }
    return `${labelValue}`;
  };
  return {
    ...input,
    styles: useStyles(input.control.value.uischema),
    appliedOptions,
    childUiSchema,
    childLabelForIndex,
    computedLabel,
  };
};

/**
 * Adds styles, appliedOptions and childUiSchema
 */
export const useVuetifyMultiEnumControl = <I extends { control: any }>(
  input: I
) => {
  const appliedOptions = useControlAppliedOptions(input);

  const childUiSchema = useChildUiSchema(input);

  return {
    ...input,
    styles: useStyles(input.control.value.uischema),
    appliedOptions,
    childUiSchema,
  };
};