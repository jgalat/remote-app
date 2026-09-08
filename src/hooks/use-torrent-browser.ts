import * as React from "react";
import {
  compareFileEntries,
  getNode,
  makeFiles,
  makeTree,
  normalize,
  type File,
  type Node,
} from "~/utils/file";
import type { TorrentFiles } from "./torrent";
import { type RenderFile } from "~/components/file-item";

export default function useTorrentBrowser(torrent: TorrentFiles | undefined) {
  const [files, root] = React.useMemo<[File[], Node]>(() => {
    const _files = torrent ? makeFiles(torrent.files, torrent.fileStats) : [];
    const _root = makeTree(_files);
    return [_files, _root] as const;
  }, [torrent]);

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
    out.sort(compareFileEntries);
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
