GIT_BRANCH = $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null)

.PHONY: deploy-staging
deploy-staging:
	git push origin $(GIT_BRANCH):staging -f
