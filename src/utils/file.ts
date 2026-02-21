import { Priority } from "~/client";
import type { ExtTorrent } from "~/hooks/transmission";

type _File = ExtTorrent["files"][number];
type Stats = ExtTorrent["fileStats"][number];

export type File = {
  id: number;
} & _File &
  Stats;

export function makeFiles(files: _File[], stats: Stats[]): File[] {
  return files.map((f, i) => ({ id: i, ...f, ...stats[i] }));
}

export type Node = {
  name: string;
  path: string;
  isFile: boolean;
  parent?: Node;
  children: Map<string, Node>;
  ids: number[];
};

export function normalize(p: string): string {
  let s = "";
  s = p.replace(/\\/g, "/");
  s = s.replace(/\/+/g, "/");
  s = s.replace(/^\/|\/$/g, "");
  return s;
}

export function makeTree(files: File[]): Node {
  const root: Node = {
    name: "",
    path: "",
    isFile: false,
    children: new Map(),
    ids: [],
  };

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const parts = normalize(f.name).split("/");
    let cur = root;

    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      const isLast = j === parts.length - 1;
      const nextPath = cur.path ? cur.path + "/" + part : part;

      let child = cur.children.get(part);
      if (!child) {
        child = {
          name: part,
          path: nextPath,
          isFile: isLast,
          parent: cur,
          children: new Map(),
          ids: [],
        };
        cur.children.set(part, child);
      }
      cur = child;
    }

    cur.ids.push(f.id);

    let p: Node | undefined = cur.parent;
    while (p) {
      p.ids.push(f.id);
      p = p.parent;
    }
  }

  return root;
}

export function getNode(root: Node, path: string): Node | undefined {
  const norm = normalize(path);
  if (!norm) return root;
  let cur: Node | undefined = root;
  const parts = norm.split("/");
  for (let i = 0; i < parts.length; i++) {
    if (!cur) return undefined;
    cur = cur.children.get(parts[i]);
  }
  return cur;
}

export function getPriority(
  files: File[]
): "Low" | "Normal" | "High" | "Mixed" {
  if (files.length === 0) return "Normal";
  if (files.every((f) => f.priority === Priority.LOW)) return "Low";
  if (files.every((f) => f.priority === Priority.NORMAL)) return "Normal";
  if (files.every((f) => f.priority === Priority.HIGH)) return "High";
  return "Mixed";
}
