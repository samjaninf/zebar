import {
  Button,
  Dialog,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@glzr/components';
import { useNavigate } from '@solidjs/router';
import { IconBrandGithub, IconFolderPlus } from '@tabler/icons-solidjs';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { For } from 'solid-js';

import {
  AppBreadcrumbs,
  CreateWidgetPackArgs,
  useUserPacks,
} from '~/common';
import { WidgetPackCard } from './WidgetPackCard';
import { CreateWidgetPackDialog } from './dialogs';

export function WidgetPacksPage() {
  const navigate = useNavigate();
  const userPacks = useUserPacks();

  async function onCreatePack(args: CreateWidgetPackArgs) {
    const newPack = await userPacks.createPack(args);
    navigate(`/packs/${newPack.id}`);
  }

  return (
    <div class="container mx-auto pt-3.5 pb-32">
      <AppBreadcrumbs entries={[]} />

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">My widgets</h1>
        <div class="flex gap-2">
          <Dialog>
            <DialogTrigger>
              <Button variant="outline">
                <IconFolderPlus class="mr-2 h-4 w-4" />
                Create new pack
              </Button>
            </DialogTrigger>
            <CreateWidgetPackDialog onSubmit={onCreatePack} />
          </Dialog>

          <Button
            variant="outline"
            onClick={() => {
              shellOpen(
                'https://github.com/glzr-io/zebar/blob/main/MARKETPLACE.md',
              );
            }}
          >
            <IconBrandGithub class="mr-2 h-4 w-4" />
            Submit to marketplace
          </Button>
        </div>
      </div>

      <Tabs defaultValue="downloaded" class="w-full">
        <TabsList>
          <TabsTrigger value="downloaded">
            Downloaded ({userPacks.downloadedPacks()?.length})
          </TabsTrigger>
          <TabsTrigger value="custom">
            Custom ({userPacks.customPacks()?.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="downloaded" class="mt-6">
          <For each={userPacks.downloadedPacks()}>
            {pack => (
              <WidgetPackCard
                pack={pack}
                onDelete={userPacks.deletePack}
              />
            )}
          </For>
        </TabsContent>

        <TabsContent value="custom" class="mt-6">
          <For each={userPacks.customPacks()}>
            {pack => (
              <WidgetPackCard
                pack={pack}
                onDelete={userPacks.deletePack}
              />
            )}
          </For>
        </TabsContent>
      </Tabs>
    </div>
  );
}
