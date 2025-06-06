import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TextField,
  SelectField,
  SwitchField,
  TooltipContent,
  Tooltip,
  TooltipTrigger,
  ChipField,
} from '@glzr/components';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-solidjs';
import { createForm, Field, FormState } from 'smorf';
import { batch, createEffect, on, Show } from 'solid-js';
import { configSchemas, WidgetConfig } from 'zebar';

import { WidgetCachingSubform } from './WidgetCachingSubform';

export interface WidgetConfigFormProps {
  config: WidgetConfig;
  packId: string;
  disabled?: boolean;
  onChange: (form: FormState<WidgetConfig>) => void;
}

export function WidgetConfigForm(props: WidgetConfigFormProps) {
  const configForm = createForm<WidgetConfig>(props.config, {
    schema: configSchemas.widget,
  });

  // Update the form when the config is different.
  createEffect(
    on(
      () => [props.packId, props.config.name],
      ([id, name], prev) => {
        const [prevId, prevName] = prev ?? [null, null];

        if (id !== prevId || name !== prevName) {
          configForm.unsetDirty();
          configForm.unsetTouched();
          configForm.setValue(props.config);
        }
      },
      { defer: true },
    ),
  );

  // Broadcast the form changes to the parent.
  createEffect(
    on(
      () => configForm.value,
      () => props.onChange(configForm),
    ),
  );

  function addNewShellCommand() {
    // 'privileges' key might not already exist for configs prior to
    // v2.7.0.
    configForm.setFieldValue('privileges', privileges => ({
      ...privileges,
      shellCommands: [
        ...privileges.shellCommands,
        {
          program: 'curl',
          argsRegex: '.*',
        },
      ],
    }));
  }

  function deleteShellCommand(targetIndex: number) {
    configForm.setFieldValue('privileges.shellCommands', commands =>
      commands.filter((_, index) => index !== targetIndex),
    );
  }

  function addNewPreset() {
    configForm.setFieldValue('presets', presets => [
      ...presets,
      {
        name: presets.length ? `default${presets.length + 1}` : 'default',
        anchor: 'center',
        offsetX: '0px',
        offsetY: '0px',
        width: '50%',
        height: '50%',
        monitorSelection: {
          type: 'all',
        },
        dockToEdge: {
          enabled: false,
          edge: null,
          windowMargin: '0px',
        },
      },
    ]);
  }

  function deletePreset(targetIndex: number) {
    configForm.setFieldValue('presets', presets =>
      presets.filter((_, index) => index !== targetIndex),
    );
  }

  function anchorToEdges(
    anchor: string,
  ): ('top' | 'left' | 'right' | 'bottom')[] {
    switch (anchor) {
      case 'top_left':
        return ['top', 'left'];
      case 'top_center':
        return ['top'];
      case 'top_right':
        return ['top', 'right'];
      case 'center_left':
        return ['left'];
      case 'center':
        return [];
      case 'center_right':
        return ['right'];
      case 'bottom_left':
        return ['bottom', 'left'];
      case 'bottom_center':
        return ['bottom'];
      case 'bottom_right':
        return ['bottom', 'right'];
      default:
        throw new Error(`Invalid anchor: ${anchor}`);
    }
  }

  return (
    <div class="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-semibold">
            Widget settings
          </CardTitle>
        </CardHeader>

        <CardContent class="space-y-4">
          <Field of={configForm} path="htmlPath">
            {(inputProps, field) => (
              <TextField
                id="html-path"
                label="HTML path"
                placeholder="path/to/widget.html"
                disabled={props.disabled}
                error={field.error()}
                {...inputProps()}
              />
            )}
          </Field>

          <Field of={configForm} path="includeFiles">
            {(inputProps, field) => (
              <ChipField
                label="Included file paths"
                description="Files that will be packaged and served with your widget (like HTML, CSS, JS, images). Glob patterns like '*.js' or 'dist/**' are supported."
                disabled={props.disabled}
                error={field.error()}
                {...inputProps()}
              />
            )}
          </Field>

          <Field of={configForm} path="zOrder">
            {(inputProps, field) => (
              <SelectField
                id="z-order"
                label="Z-order"
                placeholder="Select z-order"
                disabled={props.disabled}
                error={field.error()}
                options={[
                  {
                    value: 'normal',
                    label: 'Normal',
                  },
                  {
                    value: 'top_most',
                    label: 'Top-most (above all)',
                  },
                  {
                    value: 'bottom_most',
                    label: 'Bottom-most (on desktop)',
                  },
                ]}
                {...inputProps()}
              />
            )}
          </Field>

          <Field of={configForm} path="shownInTaskbar">
            {(inputProps, field) => (
              <SwitchField
                id="shown-in-taskbar"
                label="Shown in taskbar"
                disabled={props.disabled}
                error={field.error()}
                {...inputProps()}
              />
            )}
          </Field>

          <Field of={configForm} path="focused">
            {(inputProps, field) => (
              <SwitchField
                id="focused"
                label="Focused on launch"
                disabled={props.disabled}
                error={field.error()}
                {...inputProps()}
              />
            )}
          </Field>

          <Field of={configForm} path="resizable">
            {(inputProps, field) => (
              <SwitchField
                id="resizable"
                label="Resizable"
                disabled={props.disabled}
                error={field.error()}
                {...inputProps()}
              />
            )}
          </Field>

          <Field of={configForm} path="transparent">
            {(inputProps, field) => (
              <SwitchField
                id="transparent"
                label="Transparent"
                disabled={props.disabled}
                error={field.error()}
                {...inputProps()}
              />
            )}
          </Field>

          <WidgetCachingSubform
            value={configForm.value.caching}
            onChange={value => configForm.setFieldValue('caching', value)}
            disabled={props.disabled}
          />

          <h3 class="text-lg font-semibold">Shell privileges</h3>
          <small class="text-sm text-muted-foreground">
            Configure which shell commands are allowed to be executed by
            the widget.
          </small>

          {configForm.value.privileges.shellCommands.map((_, index) => (
            <div class="flex gap-2 items-end">
              <div class="grid grid-cols-2 flex-1 gap-2">
                <Field
                  of={configForm}
                  path={`privileges.shellCommands.${index}.program`}
                >
                  {(inputProps, field) => (
                    <TextField
                      id={`privilege-program-${index}`}
                      label="Program"
                      placeholder="Program name or full path"
                      disabled={props.disabled}
                      error={field.error()}
                      {...inputProps()}
                    />
                  )}
                </Field>

                <Field
                  of={configForm}
                  path={`privileges.shellCommands.${index}.argsRegex`}
                >
                  {(inputProps, field) => (
                    <TextField
                      id={`privilege-args-${index}`}
                      label="Arguments regex (use .* to allow all)"
                      placeholder="Regular expression for allowed arguments"
                      disabled={props.disabled}
                      error={field.error()}
                      {...inputProps()}
                    />
                  )}
                </Field>
              </div>

              <Tooltip openDelay={0} closeDelay={0}>
                <TooltipTrigger
                  as={(props: any) => (
                    <Button
                      {...props}
                      variant="secondary"
                      size="icon"
                      disabled={props.disabled}
                      onClick={() => deleteShellCommand(index)}
                    >
                      <IconTrash class="size-4" />
                    </Button>
                  )}
                />
                <TooltipContent>Delete shell command</TooltipContent>
              </Tooltip>
            </div>
          ))}

          <Button
            class="block"
            variant="outline"
            disabled={props.disabled}
            onClick={addNewShellCommand}
          >
            Add allowed shell command +
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-semibold">Presets</CardTitle>
        </CardHeader>

        <CardContent class="space-y-4">
          {configForm.value.presets.map((_, index) => (
            <div class="border p-4 rounded-md space-y-2">
              <div class="flex justify-between">
                <Field of={configForm} path={`presets.${index}.name`}>
                  {(inputProps, field) => (
                    <TextField
                      id={`name-${index}`}
                      label="Preset name"
                      error={field.error()}
                      disabled={props.disabled}
                      {...inputProps()}
                    />
                  )}
                </Field>

                <Tooltip openDelay={0} closeDelay={0}>
                  <TooltipTrigger
                    as={(props: any) => (
                      <Button
                        {...props}
                        variant="secondary"
                        size="icon"
                        onClick={() => deletePreset(index)}
                      >
                        <IconTrash class="size-4" />
                      </Button>
                    )}
                  />
                  <TooltipContent>Delete preset</TooltipContent>
                </Tooltip>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Field of={configForm} path={`presets.${index}.anchor`}>
                  {(inputProps, field) => (
                    <SelectField
                      id={`anchor-${index}`}
                      label="Anchor"
                      error={field.error()}
                      disabled={props.disabled}
                      options={
                        [
                          { value: 'top_left', label: 'Top left' },
                          { value: 'top_center', label: 'Top center' },
                          { value: 'top_right', label: 'Top right' },
                          { value: 'center_left', label: 'Center left' },
                          { value: 'center', label: 'Center' },
                          { value: 'center_right', label: 'Center right' },
                          { value: 'bottom_left', label: 'Bottom left' },
                          {
                            value: 'bottom_center',
                            label: 'Bottom center',
                          },
                          { value: 'bottom_right', label: 'Bottom right' },
                        ] as const
                      }
                      {...inputProps()}
                      onChange={(value: any) => {
                        batch(() => {
                          inputProps().onChange(value);

                          // Dock edges depend on the anchor point. Change
                          // to first valid edge for given anchor point.
                          if (
                            configForm.value.presets[index].dockToEdge
                              .edge !== null
                          ) {
                            configForm.setFieldValue(
                              `presets.${index}.dockToEdge.edge`,
                              anchorToEdges(value)[0] ?? null,
                            );
                          }
                        });
                      }}
                    />
                  )}
                </Field>

                <Field
                  of={configForm}
                  path={`presets.${index}.monitorSelection.type`}
                >
                  {(inputProps, field) => (
                    <SelectField
                      id={`monitor-${index}`}
                      label="Target monitor(s)"
                      error={field.error()}
                      disabled={props.disabled}
                      options={
                        [
                          { value: 'primary', label: 'Primary' },
                          { value: 'secondary', label: 'Secondary' },
                          { value: 'all', label: 'All' },
                        ] as const
                      }
                      {...inputProps()}
                    />
                  )}
                </Field>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* TODO: Change to px/percent input. */}
                <Field of={configForm} path={`presets.${index}.offsetX`}>
                  {(inputProps, field) => (
                    <TextField
                      id={`offset-x-${index}`}
                      label="Offset X"
                      error={field.error()}
                      disabled={props.disabled}
                      {...inputProps()}
                    />
                  )}
                </Field>

                {/* TODO: Change to px/percent input. */}
                <Field of={configForm} path={`presets.${index}.offsetY`}>
                  {(inputProps, field) => (
                    <TextField
                      id={`offset-y-${index}`}
                      label="Offset Y"
                      error={field.error()}
                      disabled={props.disabled}
                      {...inputProps()}
                    />
                  )}
                </Field>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* TODO: Change to px/percent input. */}
                <Field of={configForm} path={`presets.${index}.width`}>
                  {(inputProps, field) => (
                    <TextField
                      id={`width-${index}`}
                      label="Width"
                      error={field.error()}
                      disabled={props.disabled}
                      {...inputProps()}
                    />
                  )}
                </Field>

                {/* TODO: Change to px/percent input. */}
                <Field of={configForm} path={`presets.${index}.height`}>
                  {(inputProps, field) => (
                    <TextField
                      id={`height-${index}`}
                      label="Height"
                      error={field.error()}
                      disabled={props.disabled}
                      {...inputProps()}
                    />
                  )}
                </Field>
              </div>

              <div class="flex justify-between">
                <Field
                  of={configForm}
                  path={`presets.${index}.dockToEdge.enabled`}
                >
                  {(inputProps, field) => (
                    <SwitchField
                      id={`dock-enabled-${index}`}
                      class="flex flex-wrap items-center gap-x-4 [&>:last-child]:w-full"
                      label="Dock to edge (Windows-only)"
                      description="Whether to dock the widget to the monitor edge and reserve screen space for it."
                      error={field.error()}
                      disabled={props.disabled}
                      {...inputProps()}
                    />
                  )}
                </Field>

                <Show
                  when={
                    configForm.value.presets[index].dockToEdge.enabled &&
                    configForm.value.presets[index].anchor === 'center'
                  }
                >
                  <Tooltip openDelay={0} closeDelay={0}>
                    <TooltipTrigger
                      as={(props: any) => (
                        <IconAlertTriangle
                          class="size-5 shrink-0"
                          {...props}
                        />
                      )}
                    />
                    <TooltipContent>
                      Dock to edge has no effect with a centered anchor
                      point.
                    </TooltipContent>
                  </Tooltip>
                </Show>
              </div>

              {configForm.value.presets[index].dockToEdge.enabled &&
                configForm.value.presets[index].anchor !== 'center' && (
                  <>
                    <Field
                      of={configForm}
                      path={`presets.${index}.dockToEdge.edge`}
                    >
                      {(inputProps, field) => (
                        <>
                          <SwitchField
                            id={`dock-edge-switch-${index}`}
                            label="Dock to nearest detected edge"
                            class="flex items-center gap-x-4"
                            error={field.error()}
                            disabled={props.disabled}
                            onBlur={() => inputProps().onBlur()}
                            onChange={enabled =>
                              inputProps().onChange(
                                enabled
                                  ? null
                                  : anchorToEdges(
                                      configForm.value.presets[index]
                                        .anchor,
                                    )[0] ?? null,
                              )
                            }
                            value={inputProps().value === null}
                          />

                          <Show when={inputProps().value}>
                            <SelectField
                              id={`dock-edge-dropdown-${index}`}
                              label="Edge"
                              disabled={props.disabled}
                              options={(
                                [
                                  { value: 'top', label: 'Top' },
                                  { value: 'bottom', label: 'Bottom' },
                                  { value: 'left', label: 'Left' },
                                  { value: 'right', label: 'Right' },
                                ] as const
                              ).filter(opt =>
                                anchorToEdges(
                                  configForm.value.presets[index].anchor,
                                ).includes(opt.value),
                              )}
                              {...inputProps()}
                            />
                          </Show>
                        </>
                      )}
                    </Field>

                    {/* TODO: Change to px/percent input. */}
                    <Field
                      of={configForm}
                      path={`presets.${index}.dockToEdge.windowMargin`}
                    >
                      {(inputProps, field) => (
                        <TextField
                          id={`dock-margin-${index}`}
                          label="Margin after window"
                          description="Margin to reserve after the widget window. Can be positive or negative."
                          error={field.error()}
                          disabled={props.disabled}
                          {...inputProps()}
                        />
                      )}
                    </Field>
                  </>
                )}
            </div>
          ))}

          <Button
            onClick={addNewPreset}
            class="w-full"
            disabled={props.disabled}
          >
            Add new preset +
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
