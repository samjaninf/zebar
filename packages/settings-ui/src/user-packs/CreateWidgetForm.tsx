import { SelectField, TextField } from '@glzr/components';
import { createForm, Field, FormState } from 'smorf';
import { createEffect, on } from 'solid-js';
import { configSchemas } from 'zebar';
import { z } from 'zod';

const formSchema = z.object({
  name: configSchemas.name,
  template: z.enum(['react_buildless', 'solid_typescript']),
});

export type CreateWidgetFormProps = {
  onChange: (form: FormState<z.infer<typeof formSchema>>) => void;
};

export function CreateWidgetForm(props: CreateWidgetFormProps) {
  const form = createForm<z.infer<typeof formSchema>>(
    {
      name: '',
      template: 'react_buildless',
    },
    { schema: formSchema },
  );

  createEffect(
    on(
      () => form.value,
      () => props.onChange(form),
    ),
  );

  return (
    <div class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Field of={form} path="name">
          {(inputProps, field) => (
            <TextField
              label="Widget Name"
              placeholder="my-cool-widget"
              error={field.error()}
              {...inputProps}
            />
          )}
        </Field>
      </div>

      <div class="grid gap-2">
        <Field of={form} path="template">
          {inputProps => (
            <SelectField
              label="Template"
              placeholder="Select a template"
              options={[
                { label: 'React Buildless', value: 'react_buildless' },
                { label: 'Solid TypeScript', value: 'solid_typescript' },
              ]}
              {...inputProps}
            />
          )}
        </Field>
      </div>
    </div>
  );
}
