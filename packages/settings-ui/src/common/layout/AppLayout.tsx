import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
  ToastList,
  ToastRegion,
} from '@glzr/components';
import { createSignal, onMount, Show, type JSX } from 'solid-js';
import { RouteSectionProps } from '@solidjs/router';

import { Sidebar } from './Sidebar';
import { PreviewBar } from './PreviewBar';
import { useWidgetPreview } from '~/common';

export interface AppLayoutProps {
  children: JSX.Element;
}

export function AppLayout(props: AppLayoutProps & RouteSectionProps) {
  const widgetPreview = useWidgetPreview();
  const [sizes, setSizes] = createSignal<number[]>([0.2, 0.8]);

  // Disable the right-click context menu.
  onMount(() => {
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });
  });

  return (
    <>
      <Resizable sizes={sizes()} onSizesChange={setSizes}>
        <Sidebar
          initialSize={sizes()[0]}
          onCollapseClick={() => setSizes([0, 1])}
        />

        <ResizableHandle withHandle />

        <ResizablePanel initialSize={sizes()[1]} class="overflow-auto">
          {props.children}
        </ResizablePanel>
      </Resizable>

      <Show when={widgetPreview.previewPack()}>
        {pack => (
          <PreviewBar
            pack={pack()}
            widgetName={widgetPreview.previewWidgetName()!}
            presetName={widgetPreview.previewPresetName()!}
            onStop={widgetPreview.stopPreview}
            onChange={widgetPreview.changePreview}
          />
        )}
      </Show>

      <ToastRegion>
        <ToastList />
      </ToastRegion>
    </>
  );
}
