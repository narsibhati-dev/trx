export interface DemoPkg {
  name: string;
  version: string;
  status: "installed" | "available" | "aur";
  checked?: boolean;
}

export interface Demo {
  query: string;
  packages: DemoPkg[];
  detail: { desc: string; deps: string; size: string; version: string };
}

export const DEMOS: Demo[] = [
  {
    query: "neovim",
    packages: [
      { name: "neovim",         version: "0.10.0", status: "installed", checked: true },
      { name: "neovim-nightly", version: "0.11.0", status: "aur" },
      { name: "vim",            version: "9.1.0",  status: "available" },
      { name: "neovide",        version: "0.13.0", status: "aur" },
      { name: "vimb",           version: "0.5.1",  status: "aur" },
    ],
    detail: { desc: "Vim-based text editor with extensible Lua API", deps: "libuv, msgpack, tree-sitter", size: "18.2 MB", version: "0.10.0" },
  },
  {
    query: "ripgrep",
    packages: [
      { name: "ripgrep",     version: "14.1.0", status: "installed", checked: true },
      { name: "ripgrep-all", version: "0.9.6",  status: "aur" },
      { name: "grep",        version: "3.11",   status: "available" },
      { name: "ugrep",       version: "6.2",    status: "available" },
    ],
    detail: { desc: "Fast line-oriented search tool built in Rust", deps: "pcre2", size: "4.1 MB", version: "14.1.0" },
  },
  {
    query: "git",
    packages: [
      { name: "git",       version: "2.44.0", status: "installed", checked: true },
      { name: "git-delta", version: "0.17.0", status: "available" },
      { name: "lazygit",   version: "0.41.0", status: "available" },
      { name: "gitui",     version: "0.26.0", status: "aur" },
      { name: "gitoxide",  version: "0.36.0", status: "aur" },
    ],
    detail: { desc: "Distributed version control system", deps: "curl, openssl, zlib", size: "36.8 MB", version: "2.44.0" },
  },
];
