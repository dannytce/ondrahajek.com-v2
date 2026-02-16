.PHONY: lint tsc test build dev

lint:
	pnpm run lint

tsc:
	pnpm run type-check

test:
	@echo "No tests configured"

build:
	pnpm run build

dev:
	pnpm run dev
