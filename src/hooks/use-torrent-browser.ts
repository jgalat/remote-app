import * as React from "react";
import {
  getNode,
  makeFiles,
  makeTree,
  normalize,
  type File,
  type Node,
} from "~/utils/file";
import { ExtTorrent } from "./use-transmission";
import { type RenderFile } from "~/components/file-item";

export default function useTorrentBrowser(torrents: ExtTorrent[]) {
  const [files, root] = React.useMemo<[File[], Node]>(() => {
    const _files =
      torrents.length === 1
        ? makeFiles(torrents[0].files, torrents[0].fileStats)
        : [];
    const _root = makeTree(_files);
    return [_files, _root] as const;
  }, [torrents]);

  const [current, setCurrent] = React.useState("");

  const currentNode = React.useMemo<Node>(
    () => getNode(root, current) ?? root,
    [root, current]
  );

  const items = React.useMemo(() => {
    const out: RenderFile[] = [];
    const it = currentNode.children.values();
    let next = it.next();
    while (!next.done) {
      const child = next.value;
      out.push({
        name: child.name,
        path: child.path,
        isFile: child.isFile,
        content: child.ids.map((id) => files[id]),
      });
      next = it.next();
    }
    for (let i = 0; i < out.length - 1; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const ai = out[i],
          aj = out[j];
        const cmpType = (ai.isFile ? 1 : 0) - (aj.isFile ? 1 : 0);
        if (
          cmpType > 0 ||
          (cmpType === 0 && ai.name.localeCompare(aj.name) > 0)
        ) {
          const tmp = out[i];
          out[i] = out[j];
          out[j] = tmp;
        }
      }
    }
    return out;
  }, [currentNode, files]);

  const canGoUp = current !== "";
  const goUp = React.useCallback(() => {
    if (!canGoUp) return;
    const parts = normalize(current).split("/");
    parts.pop();
    setCurrent(parts.join("/"));
  }, [current, canGoUp]);

  const enterFolder = React.useCallback(
    (pathname: string) => {
      const p = normalize(pathname).split("/");
      const child = currentNode.children.get(p[p.length - 1]);
      if (!child || child.isFile) return;
      setCurrent(child.path);
    },
    [currentNode]
  );

  return { items, canGoUp, goUp, enterFolder };
}
