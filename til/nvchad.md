---
title: "NvChad, neovim, and installation"
date: 2024-04-27
---

I spent an hour fighting with the install of NvChad and neovim.

I did a clean install twice, and it still wouldn't find and load the init.lua file.

I finally found the issue. I had previously set the `XDG_CONFIG_HOME` variable in my `.zshrc` file.
Removing that line fixed the issue as it was interfering with the default location that NvChad/neovim was looking for the `init.lua` file.

## More fun with colors

I was using the Terminal app on my Mac, and the colors were not readable.
Checking the docs, I found that Terminal.app doesn't support true colors.
I switched to iTerm2 for nvim.
