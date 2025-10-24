# README

## About

This is the official Wails Vanilla template.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

## Arknights Gacha Integration

This app integrates the original Go backend logic via Wails.

Setup:
- Ensure .env contains PHONE and PASSWORD (already copied).
- Do NOT commit .env (now ignored in .gitignore).

Backend:
- The Go method App.RefreshGachaHistory() fetches full gacha history and returns grouped JSON by pool name.
- Logic moved to: app.go and utils/, global/.

Frontend:
- Generated bindings live in frontend/wailsjs/go/main/App.js after generation.

Local Development (commands to run manually):
- go mod tidy
- wails generate
- wails dev

Build:
- wails build

Notes:
- If the Refresh button shows "绑定方法尚未生成"，please run "wails generate" first.
- Large JSON may render slowly; consider paging/filtering if needed.
